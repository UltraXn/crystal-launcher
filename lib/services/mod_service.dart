import 'dart:io';
import 'dart:convert';
import 'package:path/path.dart' as p;
import 'package:http/http.dart' as http;
import 'package:archive/archive.dart';
import 'package:crypto/crypto.dart' as crypto;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'log_service.dart';
import '../utils/hash_utils.dart';

import 'supabase_service.dart';

import 'native_r2_service.dart';

class ModService {
  static final ModService _instance = ModService._internal();
  factory ModService() => _instance;
  ModService._internal();

  final NativeR2Service _nativeR2 = NativeR2Service();

  /// Sincroniza los mods oficiales usando la base de datos de Supabase y hashes SHA-1
  Future<void> syncOfficialMods(String gameDir, {Function(String, double)? onProgress}) async {
    final modsDir = Directory(p.join(gameDir, 'mods'));
    if (!await modsDir.exists()) await modsDir.create(recursive: true);

    logService.log("📥 Iniciando sincronización paralela desde Supabase...", category: "STORAGE");

    try {
      // 1. Obtener la lista de mods oficiales desde Supabase
      final response = await SupabaseService().client
          .from('official_mods')
          .select('name, download_url, sha1');
      
      final List<dynamic> remoteMods = response as List<dynamic>;
      final List<Map<String, dynamic>> modsToDownload = [];

      for (final mod in remoteMods) {
        final String name = mod['name'];
        final String remoteSha1 = mod['sha1'].toLowerCase();
        
        final file = File(p.join(modsDir.path, name));

        bool needDownload = true;
        if (await file.exists()) {
          final localSha1 = await HashUtils.getFileHash(file);
          if (localSha1.toLowerCase() == remoteSha1) {
            needDownload = false;
          }
        }

        if (needDownload) {
          modsToDownload.add({
            'name': name,
            'url': mod['download_url'],
            'sha1': remoteSha1,
          });
        }
      }

      if (modsToDownload.isEmpty) {
        logService.log("✅ Todos los mods están actualizados.", category: "STORAGE");
        return;
      }

      logService.log("🚀 Descargando ${modsToDownload.length} mods en paralelo...", category: "STORAGE");
      
      await _nativeR2.downloadModsBatch(
        modsToDownload,
        modsDir.path,
        onProgress: (current, total, message) {
          if (onProgress != null) {
            onProgress(message, current / total);
          }
        },
      );

      // 2. Guardar manifiesto de mods oficiales para limpieza futura si se desea
      final List<String> currentOfficialFiles = remoteMods.map((m) => m['name'] as String).toList();
      final manifestFile = File(p.join(gameDir, '.official_mods'));
      await manifestFile.writeAsString(currentOfficialFiles.join('\n'));

      // 3. Guardar Fingerprint para isUpdateAvailable
      final latestRemote = remoteMods.isNotEmpty ? remoteMods[0]['created_at'] : "none";
      final remoteCount = remoteMods.length;
      final fingerprintFile = File(p.join(gameDir, '.modpack_fingerprint'));
      await fingerprintFile.writeAsString("$remoteCount|$latestRemote");

      logService.log("✨ Sincronización completada. ${remoteMods.length} mods verificados.", category: "STORAGE");
    } catch (e) {
      logService.log("❌ Error en sincronización: $e", level: Level.error, category: "STORAGE");
      rethrow;
    }
  }

  /// URL del Manifiesto de Versión (Cloudflare R2)
  String versionManifestUrl =
      'https://pub-3a18f6cd71c44a49b8f2f2e48e14a744.r2.dev/launcher/version.json';

  /// Cache de metadatos de mods por hash
  final Map<String, Map<String, dynamic>> _metadataCache = {};

  /// Tracker para evitar identificaciones duplicadas en paralelo por el mismo HASH
  final Map<String, Future<ModItem>> _idInProgress = {};

  String? _currentGameDir;
  List<ModItem>? _cachedMods;
  Future<List<ModItem>>? _scanFuture;

  /// Lists all mods in the given game directory.
  Future<List<ModItem>> getLocalMods(
    String gameDir, {
    bool forceRefresh = false,
  }) async {
    _currentGameDir = gameDir;
    
    // Cargar caché si es la primera vez
    if (_metadataCache.isEmpty) {
      await _loadMetadataCache(gameDir);
    }

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
        logService.log(
          "🔍 Fallback: No mods in ${primaryDir.path}. Scanning ${mcDir.path}",
          category: "STORAGE"
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

  /// Calcula el SHA-1 de un archivo para identificación de forma eficiente (Streaming)
  Future<String> _calculateFileHash(String filePath) async {
    try {
      final file = File(filePath);
      final stream = file.openRead();
      final hash = await crypto.sha1.bind(stream).first;
      return hash.toString();
    } catch (e) {
      logService.log("❌ Error calculando hash para $filePath: $e", level: Level.error, category: "STORAGE");
      return "";
    }
  }

  /// Consulta Modrinth para obtener metadatos enriquecidos
  Future<ModItem> identifyModMetadata(ModItem item) async {
    final hash = await _calculateFileHash(item.path);
    if (hash.isEmpty) return item;

    // Si ya está en la caché normal de metadatos, retornamos de inmediato
    if (_metadataCache.containsKey(hash)) {
      final data = _metadataCache[hash]!;
      return item.copyWith(
        name: data['title'] ?? item.name,
        description: data['description'],
        iconUrl: data['icon_url'],
        categories: List<String>.from(data['categories'] ?? []),
      );
    }

    // Si hay una identificación en curso para este HASH, esperamos a ESA futura
    if (_idInProgress.containsKey(hash)) {
      final Future<ModItem> pending = _idInProgress[hash]!;
      final result = await pending;
      // Retornamos una copia basándonos en el item original pero con el metadata identificado
      return item.copyWith(
        name: result.name,
        description: result.description,
        iconUrl: result.iconUrl,
        categories: result.categories,
        category: result.category,
      );
    }

    // Iniciamos nueva identificación y la guardamos en el tracker
    final Future<ModItem> idFuture = _performIdentification(item, hash);
    _idInProgress[hash] = idFuture;

    try {
      final result = await idFuture;
      // Guardar caché persistente tras éxito si no estaba ya
      if (_currentGameDir != null) {
        await _saveMetadataCache(_currentGameDir!);
      }
      return result;
    } finally {
      _idInProgress.remove(hash);
    }
  }

  Future<void> _loadMetadataCache(String gameDir) async {
    try {
      final cacheFile = File(p.join(gameDir, 'mod_metadata.json'));
      if (await cacheFile.exists()) {
        final content = await cacheFile.readAsString();
        final Map<String, dynamic> data = json.decode(content);
        data.forEach((key, value) {
          _metadataCache[key] = Map<String, dynamic>.from(value);
        });
        logService.log("💾 Metadata cache cargada: ${_metadataCache.length} items", category: "STORAGE");
      }
    } catch (e) {
      logService.log("⚠️ No se pudo cargar la caché de metadatos: $e", level: Level.warning, category: "STORAGE");
    }
  }

  Future<void> _saveMetadataCache(String gameDir) async {
    try {
      final cacheFile = File(p.join(gameDir, 'mod_metadata.json'));
      await cacheFile.writeAsString(json.encode(_metadataCache));
    } catch (e) {
      logService.log("⚠️ No se pudo guardar la caché de metadatos: $e", level: Level.warning, category: "STORAGE");
    }
  }

  Future<ModItem> _performIdentification(ModItem item, String hash) async {
    try {
      logService.log("🔍 Identificando mod en Modrinth: ${item.name} ($hash)", category: "NETWORK");
      
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
      logService.log("No se pudo identificar metadatos para ${item.name}: $e", level: Level.warning, category: "NETWORK");
    }
    return item;
  }

  Future<ModItem> _identifyWithCurseForge(ModItem item) async {
    final apiKey = dotenv.env['CURSEFORGE_API_KEY'];
    if (apiKey == null || apiKey.isEmpty) {
      logService.log("CurseForge API Key no configurada.", level: Level.warning, category: "SYSTEM");
      return item;
    }

    try {
      final fileBytes = await File(item.path).readAsBytes();
      final fingerprint = HashUtils.calculateCurseForgeFingerprint(fileBytes);

      logService.log("🔍 Identificando en CurseForge: ${item.name} ($fingerprint)", category: "NETWORK");
      
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
      logService.log("Fallo identificación en CurseForge para ${item.name}: $e", level: Level.warning, category: "NETWORK");
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
      logService.log("Error buscando mods en Modrinth: $e", level: Level.error, category: "NETWORK");
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

        logService.log("📥 Descargando mod: $fileName desde $downloadUrl", category: "NETWORK");
        
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
      logService.log("Error instalando mod remoto ($projectId): $e", level: Level.error, category: "NETWORK");
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

    logService.log("Mod ${mod.name} ${mod.isEnabled ? 'deshabilitado' : 'habilitado'}.", category: "STORAGE");
  }

  /// Checks if a modpack update is available using a fingerprint (count + max timestamp) from Supabase.
  Future<bool> isUpdateAvailable(String gameDir) async {
    try {
      // Fetch latest modification from Supabase (efficient)
      final response = await SupabaseService().client
          .from('official_mods')
          .select('created_at')
          .order('created_at', ascending: false);
      
      final List<dynamic> data = response as List<dynamic>;
      if (data.isEmpty) return false;

      final latestRemote = data[0]['created_at'].toString();
      final remoteCount = data.length;

      final localFingerprintFile = File(p.join(gameDir, '.modpack_fingerprint'));
      if (!await localFingerprintFile.exists()) return true;

      final localFingerprint = await localFingerprintFile.readAsString();
      final expected = "$remoteCount|$latestRemote";
      
      return localFingerprint.trim() != expected;
    } catch (e) {
      logService.log("Error checking for updates via Supabase", level: Level.error, category: "STORAGE", error: e);
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
      logService.log("Failed to validate mod file: ${file.path}", level: Level.error, category: "STORAGE", error: e);
      return false;
    }
  }

  bool _hasModMetadata(Archive archive, String filePath) {
    for (final zipFile in archive) {
      if (_isMetadataPath(zipFile.name.toLowerCase())) {
        logService.log("Found mod metadata: ${zipFile.name} in $filePath", category: "STORAGE");
        return true;
      }
    }
    logService.log("No mod metadata found in $filePath.", level: Level.warning, category: "STORAGE");
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
