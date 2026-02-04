import 'dart:io';
import 'dart:convert';

import 'package:path/path.dart' as p;
import 'package:http/http.dart' as http;
import 'package:archive/archive.dart';
import 'package:crypto/crypto.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../utils/logger.dart';
import '../utils/hash_utils.dart';
import 'package:dio/dio.dart' as dio_pkg;

import 'supabase_service.dart';

class ModService {
  static final ModService _instance = ModService._internal();
  factory ModService() => _instance;
  ModService._internal();

  /// Sincroniza los mods oficiales usando la base de datos de Supabase y hashes SHA-1
  Future<void> syncOfficialMods(String gameDir, {Function(String, double)? onProgress}) async {
    final modsDir = Directory(p.join(gameDir, 'mods'));
    if (!await modsDir.exists()) await modsDir.create(recursive: true);

    logger.i("📥 Iniciando sincronización por HASH desde Supabase...");

    try {
      // 1. Obtener la lista de mods oficiales desde Supabase
      final response = await SupabaseService().client
          .from('official_mods')
          .select('name, download_url, sha1');
      
      final List<dynamic> remoteMods = response as List<dynamic>;
      final List<String> currentOfficialFiles = [];

      final dio = dio_pkg.Dio();

      for (final mod in remoteMods) {
        final String name = mod['name'];
        final String url = mod['download_url'];
        final String remoteSha1 = mod['sha1'].toLowerCase();
        
        final file = File(p.join(modsDir.path, name));
        currentOfficialFiles.add(name);

        bool needDownload = true;

        if (await file.exists()) {
          final localSha1 = await HashUtils.getFileHash(file);
          if (localSha1.toLowerCase() == remoteSha1) {
            logger.d("✅ Mod up-to-date: $name");
            needDownload = false;
          } else {
            logger.w("🔄 Mod mismatch (Hash): $name. Re-downloading...");
          }
        } else {
          logger.i("🆕 Mod missing: $name. Downloading...");
        }

        if (needDownload) {
          if (onProgress != null) onProgress(name, 0);
          
          await dio.download(
            url, 
            file.path,
            onReceiveProgress: (received, total) {
              if (onProgress != null && total > 0) {
                onProgress(name, received / total);
              }
            },
          );
          
          // Verificar hash post-descarga
          final newHash = await HashUtils.getFileHash(file);
          if (newHash.toLowerCase() != remoteSha1) {
            logger.e("❌ Error: Hash mismatch tras descargar $name. Esperado: $remoteSha1, Recibido: $newHash");
          } else {
            logger.i("✔ OK: $name");
          }
        }
      }

      // 2. Guardar manifiesto de mods oficiales para limpieza futura si se desea
      final manifestFile = File(p.join(gameDir, '.official_mods'));
      await manifestFile.writeAsString(currentOfficialFiles.join('\n'));

      logger.i("✨ Sincronización completada. ${remoteMods.length} mods verificados.");
    } catch (e) {
      logger.e("❌ Error en syncOfficialMods: $e");
      rethrow;
    }
  }

  /// URL del Modpack (Deprecated - Usar syncOfficialMods)
  String modpackUrl =
      'https://drive.google.com/uc?export=download&id=1iPT1JRAW4R6XQTA5TrnB_dNim9LlHrf-';

  /// URL del Manifiesto de Versión
  String versionManifestUrl =
      'https://raw.githubusercontent.com/UltraXn/CrystalTides-Assets/main/launcher/version.json';

  /// Cache de metadatos de mods por hash
  final Map<String, Map<String, dynamic>> _metadataCache = {};

  Future<void> downloadAndInstallModpack(
    String url,
    String gameDir, {
    bool clearOld = true,
    Function(double)? onProgress,
  }) async {
    final modsDir = Directory(p.join(gameDir, 'mods'));
    logger.i("🛠️ Iniciando Modpack (Bypass Nivel 4)");

    final dio = dio_pkg.Dio(dio_pkg.BaseOptions(
      followRedirects: true,
      maxRedirects: 15,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(minutes: 15),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Referer': 'https://drive.google.com/',
      },
    ));

    String downloadUrl = url;
    String? cookie;

    try {
      // 1. Intentar obtener el token y cookies de la página de aviso
      logger.d("🔍 Analizando seguridad de Google Drive...");
      final checkResponse = await dio.get(url);
      
      // Capturar cookies de sesión (importante para archivos protegidos)
      final cookies = checkResponse.headers['set-cookie'];
      if (cookies != null && cookies.isNotEmpty) {
        cookie = cookies.map((c) => c.split(';')[0]).join('; ');
        logger.d("🍪 Cookies de sesión capturadas.");
      }

      if (checkResponse.data is String) {
        final String html = checkResponse.data;
        
        // Extraer ID del archivo de la URL original
        final idMatch = RegExp(r'id=([a-zA-Z0-9_-]+)').firstMatch(url);
        final fileId = idMatch?.group(1) ?? "1iPT1JRAW4R6XQTA5TrnB_dNim9LlHrf-";

        // Intentar buscar token 'confirm' por todos los medios
        String? token;
        final tokenMatches = [
          RegExp(r'confirm=([a-zA-Z0-9_]+)').firstMatch(html),
          RegExp(r'id="uc-download-link"[^>]*href="[^"]*confirm=([a-zA-Z0-9_]+)').firstMatch(html),
          RegExp(r'name="confirm" value="([a-zA-Z0-9_]+)"').firstMatch(html),
        ];

        for (var m in tokenMatches) {
          if (m != null) {
            token = m.group(1);
            break;
          }
        }

        if (token != null) {
          // Usar el dominio de contenido persistente para evitar bloqueos
          downloadUrl = "https://drive.usercontent.google.com/download?id=$fileId&confirm=$token&export=download";
          logger.i("🔓 Bypass Directo activado. Token: $token");
        } else {
          // Si no hay token, quizá el link ya es directo o es un error de cuota
          if (html.contains("Google Drive - Quota exceeded") || html.contains("cuota de descarga")) {
            throw Exception("Cuota de descarga excedida en Google Drive. Inténtalo más tarde o usa un espejo.");
          }
          logger.w("⚠️ No se detectó token de confirmación. Intentando descarga directa...");
        }
      }

      // 2. Preparar carpeta
      if (await modsDir.exists() && clearOld) {
        await modsDir.delete(recursive: true);
      }
      await modsDir.create(recursive: true);

      // 3. Descarga real con cookies y headers reforzados
      logger.i("🚀 Descargando Modpack...");
      final response = await dio.get<List<int>>(
        downloadUrl,
        options: dio_pkg.Options(
          responseType: dio_pkg.ResponseType.bytes,
          headers: cookie != null ? {'Cookie': cookie} : null,
        ),
        onReceiveProgress: (received, total) {
          if (onProgress != null) onProgress(total > 0 ? received / total : -1);
        },
      );

      final bytes = response.data!;

      // VALIDACIÓN DE ZIP
      if (bytes.length < 4 || bytes[0] != 0x50 || bytes[1] != 0x4B) {
        // Analizar qué recibimos
        final body = utf8.decode(bytes.take(500).toList(), allowMalformed: true);
        if (body.contains("<title>")) {
          final titleMatch = RegExp(r'<title>(.*?)</title>').firstMatch(body);
          final title = titleMatch?.group(1) ?? "Página desconocida";
          throw Exception("Google denegó la descarga: $title");
        }
        throw Exception("El archivo recibido no es un ZIP válido (Firma PK no encontrada).");
      }

      logger.i("📦 ¡Descarga exitosa! (${(bytes.length / 1024 / 1024).toStringAsFixed(1)} MB). Instalando...");

      // 4. Descomprimir
      final archive = ZipDecoder().decodeBytes(bytes);
      final List<String> officialFiles = [];

      for (final file in archive) {
        if (file.isFile) {
          final filename = file.name;
          if (filename.contains('__MACOSX') || filename.contains('.DS_Store')) continue;
          final baseName = p.basename(filename);
          officialFiles.add(baseName);
          final targetFile = File(p.join(modsDir.path, baseName));
          await targetFile.create(recursive: true);
          await targetFile.writeAsBytes(file.content as List<int>);
        }
      }

      final manifestFile = File(p.join(gameDir, '.official_mods'));
      await manifestFile.writeAsString(officialFiles.join('\n'));
      
      logger.i("✅ Todo listo. ${officialFiles.length} mods instalados.");

    } catch (e) {
      logger.e("❌ Error: $e");
      rethrow;
    }
  }

  List<ModItem>? _cachedMods;
  Future<List<ModItem>>? _scanFuture;

  /// Lists all mods in the given game directory.
  Future<List<ModItem>> getLocalMods(
    String gameDir, {
    bool forceRefresh = false,
  }) async {
    if (_cachedMods != null && !forceRefresh) {
      return _cachedMods!;
    }

    if (_scanFuture != null && !forceRefresh) {
      return _scanFuture!;
    }

    _scanFuture = _performScan(gameDir);
    try {
      final results = await _scanFuture!;
      _cachedMods = List.from(results);
      return results;
    } finally {
      _scanFuture = null;
    }
  }

  Future<List<ModItem>> _performScan(String gameDir) async {
    final List<ModItem> items = [];

    // Cargar mods oficiales
    final manifestFile = File(p.join(gameDir, '.official_mods'));
    final Set<String> officialFiles = {};
    if (await manifestFile.exists()) {
      final content = await manifestFile.readAsString();
      officialFiles.addAll(content.split('\n').where((s) => s.isNotEmpty));
    }

    // 1. Scan primary directory (.crystaltides/mods)
    final primaryDir = Directory(p.join(gameDir, 'mods'));
    if (await primaryDir.exists()) {
      items.addAll(await _scanDirectory(primaryDir, officialFiles));
    }

    // 2. Fallback to .minecraft if primary is empty
    if (items.isEmpty) {
      final mcDir = _getMinecraftModsDir();
      if (mcDir != null && await mcDir.exists()) {
        logger.i(
          "🔍 Fallback: No mods in ${primaryDir.path}. Scanning ${mcDir.path}",
        );
        // When scanning .minecraft, everything is marked as imported
        items.addAll(await _scanDirectory(mcDir, {}));
      }
    }

    // Sort alphabetically
    items.sort((a, b) => a.name.compareTo(b.name));
    return items;
  }

  Future<List<ModItem>> _scanDirectory(
    Directory dir,
    Set<String> officialFiles,
  ) async {
    final List<ModItem> items = [];
    final stream = dir.list();

    await for (var entity in stream) {
      if (entity is! File) continue;

      final name = p.basename(entity.path);
      if (name.endsWith('.jar') || name.endsWith('.jar.disabled')) {
        final pureName = name
            .replaceAll('.jar.disabled', '')
            .replaceAll('.jar', '');

        // Intentar identificar el mod (asíncronamente, no bloqueamos el scan inicial)
        final item = ModItem(
          name: pureName,
          fileName: name,
          isEnabled: !name.endsWith('.disabled'),
          path: entity.path,
          category: _categorizeMod(name),
          isImported: !officialFiles.contains(
            name.replaceAll('.disabled', ''),
          ),
        );
        items.add(item);
      }
    }
    return items;
  }

  /// Calcula el SHA-1 de un archivo para identificación
  Future<String> _calculateFileHash(String filePath) async {
    final file = File(filePath);
    final bytes = await file.readAsBytes();
    return sha1.convert(bytes).toString();
  }

  /// Consulta Modrinth para obtener metadatos enriquecidos
  Future<ModItem> identifyModMetadata(ModItem item) async {
    try {
      final hash = await _calculateFileHash(item.path);

      if (_metadataCache.containsKey(hash)) {
        final data = _metadataCache[hash]!;
        return item.copyWith(
          name: data['title'] ?? item.name,
          description: data['description'],
          iconUrl: data['icon_url'],
          categories: List<String>.from(data['categories'] ?? []),
        );
      }

      logger.d("🔍 Identificando mod en Modrinth: ${item.name} ($hash)");
      
      // 1. Obtener versión por hash
      final versionResponse = await http.get(
        Uri.parse('https://api.modrinth.com/v2/version_file/$hash'),
        headers: {'User-Agent': 'UltraXn/CrystalTides-Launcher/1.0.0'},
      );

      if (versionResponse.statusCode != 200) return item;

      final versionData = json.decode(versionResponse.body);
      final projectId = versionData['project_id'];

      // 2. Obtener detalles del proyecto
      final projectResponse = await http.get(
        Uri.parse('https://api.modrinth.com/v2/project/$projectId'),
        headers: {'User-Agent': 'UltraXn/CrystalTides-Launcher/1.0.0'},
      );

      if (projectResponse.statusCode == 200) {
        final projectData = json.decode(projectResponse.body);
        
        final cats = List<String>.from(projectData['categories'] ?? [])
            .where((c) => c != 'fabric' && c != 'quilt' && c != 'minecraft')
            .toList();

        final metadata = {
          'title': projectData['title'],
          'description': projectData['description'] ?? projectData['summary'],
          'icon_url': projectData['icon_url'],
          'categories': cats,
        };
        
        _metadataCache[hash] = metadata;

        ModCategory updatedCategory = item.category;
        if (cats.contains('library') || cats.contains('api')) {
          updatedCategory = ModCategory.library;
        } else if (cats.any((c) => 
            ['optimization', 'visual', 'gui', 'user-interface', 'hud'].contains(c))) {
          updatedCategory = ModCategory.client;
        }

        return item.copyWith(
          name: projectData['title'] ?? item.name,
          description: projectData['summary'] ?? projectData['description'],
          iconUrl: projectData['icon_url'],
          categories: cats,
          category: updatedCategory,
        );
      }

      // 3. Fallback: CurseForge
      return await _identifyWithCurseForge(item);
    } catch (e) {
      logger.w("No se pudo identificar metadatos para ${item.name}: $e");
    }
    return item;
  }

  Future<ModItem> _identifyWithCurseForge(ModItem item) async {
    final apiKey = dotenv.env['CURSEFORGE_API_KEY'];
    if (apiKey == null || apiKey.isEmpty) {
      logger.w("CurseForge API Key no configurada.");
      return item;
    }

    try {
      final fileBytes = await File(item.path).readAsBytes();
      final fingerprint = HashUtils.calculateCurseForgeFingerprint(fileBytes);

      logger.d("🔍 Identificando en CurseForge: ${item.name} ($fingerprint)");
      
      final response = await http.post(
        Uri.parse('https://api.curseforge.com/v1/fingerprints'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-api-key': apiKey,
        },
        body: jsonEncode({
          'fingerprints': [fingerprint]
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final matches = data['data']['exactMatches'] as List;
        
        if (matches.isNotEmpty) {
          final match = matches.first;
          final modId = match['id']; // ID del Mod en CF

          // Obtener detalles del mod
          final modResponse = await http.get(
            Uri.parse('https://api.curseforge.com/v1/mods/$modId'),
            headers: {
              'Accept': 'application/json',
              'x-api-key': apiKey,
            },
          );

          if (modResponse.statusCode == 200) {
            final modData = json.decode(modResponse.body)['data'];
            
            final cats = (modData['categories'] as List?)
                    ?.map((c) => c['name'].toString())
                    .toList() ??
                [];

            final metadata = {
              'title': modData['name'],
              'description': modData['summary'],
              'icon_url': modData['logo']?['url'],
              'categories': cats,
            };
            
            _metadataCache[fingerprint.toString()] = metadata;

            ModCategory updatedCategory = item.category;
            if (cats.any((c) => c.contains('Libraries') || c.contains('API'))) {
              updatedCategory = ModCategory.library;
            } else if (cats.any((c) => 
                c.contains('Performance') || 
                c.contains('Visuals') || 
                c.contains('Map') || 
                c.contains('UI'))) {
              updatedCategory = ModCategory.client;
            }

            return item.copyWith(
              name: modData['name'] ?? item.name,
              description: modData['summary'],
              iconUrl: modData['logo']?['url'],
              categories: cats,
              category: updatedCategory,
            );
          }
        }
      }
    } catch (e) {
      logger.w("Fallo identificación en CurseForge para ${item.name}: $e");
    }
    return item;
  }

  Future<List<Map<String, dynamic>>> searchRemoteMods(
    String query, {
    String? category,
    String? gameVersion,
  }) async {
    try {
      String facets = '[["categories:fabric"]';
      if (gameVersion != null && gameVersion.isNotEmpty) {
        facets += ',["versions:$gameVersion"]';
      }
      if (category != null && category.isNotEmpty) {
        facets += ',["categories:$category"]';
      }
      facets += ']';

      final response = await http.get(
        Uri.parse(
          'https://api.modrinth.com/v2/search?query=$query&facets=$facets&index=relevance',
        ),
        headers: {'User-Agent': 'UltraXn/CrystalTides-Launcher/1.0.0'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return List<Map<String, dynamic>>.from(data['hits']);
      }
    } catch (e) {
      logger.e("Error buscando mods en Modrinth: $e");
    }
    return [];
  }

  Future<bool> installRemoteMod(
    String projectId,
    String gameDir, {
    String gameVersion = "1.20.1",
  }) async {
    try {
      final gv = gameVersion == "1.21.x" ? "1.21" : gameVersion;
      // 1. Obtener versiones
      final response = await http.get(
        Uri.parse(
          'https://api.modrinth.com/v2/project/$projectId/version?loaders=["fabric"]&game_versions=["$gv"]',
        ),
        headers: {'User-Agent': 'UltraXn/CrystalTides-Launcher/1.0.0'},
      );

      if (response.statusCode == 200) {
        final versions = json.decode(response.body) as List;
        if (versions.isEmpty) return false;

        final latestVersion = versions.first;
        final file = (latestVersion['files'] as List).firstWhere(
          (f) => f['primary'] == true,
          orElse: () => latestVersion['files'][0],
        );

        final downloadUrl = file['url'];
        final fileName = file['filename'];
        final savePath = p.join(gameDir, 'mods', fileName);

        logger.i("📥 Descargando mod: $fileName desde $downloadUrl");
        
        final modResponse = await http.get(Uri.parse(downloadUrl));
        if (modResponse.statusCode == 200) {
          final targetFile = File(savePath);
          if (!await targetFile.parent.exists()) {
            await targetFile.parent.create(recursive: true);
          }
          await targetFile.writeAsBytes(modResponse.bodyBytes);
          
          // Forzar refresco de la caché de mods locales
          _cachedMods = null;
          return true;
        }
      }
    } catch (e) {
      logger.e("Error instalando mod remoto ($projectId): $e");
    }
    return false;
  }

  Directory? _getMinecraftModsDir() {
    if (Platform.isWindows) {
      final appData = Platform.environment['APPDATA'];
      if (appData != null) {
        return Directory(p.join(appData, '.minecraft', 'mods'));
      }
    } else {
      final home = Platform.environment['HOME'];
      if (home == null) return null;

      if (Platform.isLinux) {
        return Directory(p.join(home, '.minecraft', 'mods'));
      } else if (Platform.isMacOS) {
        return Directory(
          p.join(home, 'Library', 'Application Support', 'minecraft', 'mods'),
        );
      }
    }
    return null;
  }

  /// Toggles a mod between enabled and disabled.
  Future<void> toggleMod(ModItem mod) async {
    final file = File(mod.path);
    if (!await file.exists()) throw Exception("El archivo del mod no existe.");

    String newPath;
    if (mod.isEnabled) {
      newPath = "${mod.path}.disabled";
    } else {
      newPath = mod.path.replaceAll('.jar.disabled', '.jar');
    }

    await file.rename(newPath);

    // Update cache
    if (_cachedMods != null) {
      final index = _cachedMods!.indexWhere((m) => m.path == mod.path);
      if (index != -1) {
        _cachedMods![index] = mod.copyWith(
          isEnabled: !mod.isEnabled,
          path: newPath,
          fileName: p.basename(newPath),
        );
      }
    }

    logger.i(
      "Mod ${mod.name} ${mod.isEnabled ? 'deshabilitado' : 'habilitado'}.",
    );
  }

  /// Checks if a modpack update is available.
  Future<bool> isUpdateAvailable(String gameDir) async {
    try {
      final response = await http.get(Uri.parse(versionManifestUrl));
      if (response.statusCode != 200) return false;

      final manifest = json.decode(response.body);
      final remoteVersion = manifest['modpack_version']?.toString() ?? "1.0.0";

      final localVersionFile = File(p.join(gameDir, '.modpack_version'));
      if (!await localVersionFile.exists()) return true;

      final localVersion = await localVersionFile.readAsString();
      return remoteVersion != localVersion.trim();
    } catch (e) {
      logger.e("Error checking for updates", error: e);
      return false;
    }
  }

  /// Checks if a file is a valid JAR mod by looking for metadata files.
  Future<bool> isValidMod(File file) async {
    try {
      final bytes = await file.readAsBytes();
      final archive = ZipDecoder().decodeBytes(bytes);
      return _hasModMetadata(archive, file.path);
    } catch (e) {
      logger.e("Failed to validate mod file: ${file.path}", error: e);
      return false;
    }
  }

  bool _hasModMetadata(Archive archive, String filePath) {
    for (final zipFile in archive) {
      if (_isMetadataPath(zipFile.name.toLowerCase())) {
        logger.d("Found mod metadata: ${zipFile.name} in $filePath");
        return true;
      }
    }
    logger.w("No mod metadata found in $filePath.");
    return false;
  }

  bool _isMetadataPath(String path) {
    return path == 'meta-inf/neoforge.mods.toml' ||
        path == 'meta-inf/mods.toml' ||
        path == 'fabric.mod.json' ||
        path == 'mcmod.info' ||
        path == 'quilt.mod.json' ||
        path.endsWith('/fabric.mod.json') ||
        path.endsWith('/neoforge.mods.toml');
  }

  ModCategory _categorizeMod(String name) {
    final lower = name.toLowerCase();
    if (_isLibrary(lower)) return ModCategory.library;
    if (_isClientSide(lower)) return ModCategory.client;
    return ModCategory.server;
  }

  bool _isLibrary(String lower) {
    return lower.contains('api') ||
        lower.contains('lib') ||
        lower.contains('core') ||
        lower.contains('config') ||
        lower.contains('cloth') ||
        lower.contains('architectury') ||
        lower.contains('citadel') ||
        lower.contains('curios') ||
        lower.contains('geckolib') ||
        lower.contains('patchouli') ||
        lower.contains('kotlin') ||
        lower.contains('mixin') ||
        lower.contains('yacl') ||
        lower.contains('framework') ||
        lower.contains('common') ||
        lower.contains('library') ||
        lower.contains('ftb') ||
        lower.contains('owo') ||
        lower.contains('cardinal') ||
        lower.contains('resource') ||
        lower.contains('balm') ||
        lower.contains('bookshelf') ||
        lower.contains('cupboard') ||
        lower.contains('puzzleslib') ||
        lower.contains('konkrete') ||
        lower.contains('placeholderapi') ||
        lower.contains('creativecore') ||
        lower.contains('blueprint') ||
        lower.contains('iceberg') ||
        lower.contains('prism') ||
        lower.contains('ferritecore') ||
        lower.contains('collective') ||
        lower.contains('supermartijn642') ||
        lower.contains('puz') ||
        lower.contains('mcpitanlib') ||
        lower.contains('architects') ||
        lower.contains('applecore');
  }

  bool _isClientSide(String lower) {
    return lower.contains('jei') ||
        lower.contains('rei') ||
        lower.contains('emi') ||
        lower.contains('jade') ||
        lower.contains('wthit') ||
        lower.contains('xaero') ||
        lower.contains('map') ||
        lower.contains('mouse') ||
        lower.contains('toast') ||
        lower.contains('inventory') ||
        lower.contains('skin') ||
        lower.contains('menu') ||
        lower.contains('loading') ||
        lower.contains('rubidium') ||
        lower.contains('oculus') ||
        lower.contains('sodium') ||
        lower.contains('iris') ||
        lower.contains('shader') ||
        lower.contains('optifine') ||
        lower.contains('zoom') ||
        lower.contains('controllable') ||
        lower.contains('searchables') ||
        lower.contains('fps') ||
        lower.contains('performance') ||
        lower.contains('boost') ||
        lower.contains('optimization') ||
        lower.contains('starlight') ||
        lower.contains('krypton') ||
        lower.contains('modernfix') ||
        lower.contains('debugify') ||
        lower.contains('entityculling') ||
        lower.contains('ambient') ||
        lower.contains('sound') ||
        lower.contains('particle') ||
        lower.contains('animation') ||
        lower.contains('dark') ||
        lower.contains('fancy') ||
        lower.contains('smooth') ||
        lower.contains('chunk') ||
        lower.contains('light') ||
        lower.contains('fog') ||
        lower.contains('dynamic') ||
        lower.contains('appleskin') ||
        lower.contains('controlling') ||
        lower.contains('reauth') ||
        lower.contains('auth') ||
        lower.contains('no') ||
        lower.contains('fix') ||
        lower.contains('tooltip') ||
        lower.contains('journeymap') ||
        lower.contains('pretty') ||
        lower.contains('particle');
  }
}
enum ModCategory { library, client, server }

class ModItem {
  final String name;
  final String fileName;
  final bool isEnabled;
  final String path;
  final ModCategory category;
  final bool isImported;
  final String? iconUrl;
  final String? description;
  final List<String> categories;

  ModItem({
    required this.name,
    required this.fileName,
    required this.isEnabled,
    required this.path,
    this.category = ModCategory.server,
    this.isImported = false,
    this.iconUrl,
    this.description,
    this.categories = const [],
  });

  ModItem copyWith({
    String? name,
    String? fileName,
    bool? isEnabled,
    String? path,
    ModCategory? category,
    bool? isImported,
    String? iconUrl,
    String? description,
    List<String>? categories,
  }) {
    return ModItem(
      name: name ?? this.name,
      fileName: fileName ?? this.fileName,
      isEnabled: isEnabled ?? this.isEnabled,
      path: path ?? this.path,
      category: category ?? this.category,
      isImported: isImported ?? this.isImported,
      iconUrl: iconUrl ?? this.iconUrl,
      description: description ?? this.description,
      categories: categories ?? this.categories,
    );
  }
}
