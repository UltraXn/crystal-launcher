import 'dart:convert';
import 'dart:io';
import 'dart:isolate';
import 'package:http/http.dart' as http;
import 'package:path/path.dart' as p;
import 'package:crypto/crypto.dart';
// import 'package:archive/archive.dart';
import '../utils/logger.dart';
import 'native_api.dart';

// Progress callback type
typedef ProgressCallback = void Function(String status, double progress);

class GameInstallerService {
  // Singleton pattern
  static final GameInstallerService _instance =
      GameInstallerService._internal();
  factory GameInstallerService() => _instance;
  GameInstallerService._internal();

  static const String versionManifestUrl =
      "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json";
  static const String neoforgeMavenUrl =
      "https://maven.neoforged.net/releases/net/neoforged/neoforge";

  /// Main method to install a specific Minecraft version
  Future<void> installVersion({
    required String versionId,
    required String gameDirectory,
    ProgressCallback? onProgress,
  }) async {
    try {
      logger.i("Starting installation for $versionId in $gameDirectory");
      onProgress?.call("Iniciando instalación...", 0.0);

      final versionDir = p.join(gameDirectory, 'versions', versionId);
      await Directory(versionDir).create(recursive: true);

      // 1. Get Version Manifest
      onProgress?.call("Obteniendo manifiesto de versión...", 0.05);
      final versionJsonUrl = await _getVersionJsonUrl(versionId);
      if (versionJsonUrl == null) {
        throw Exception(
          "Versión $versionId no encontrada en el manifiesto oficial.",
        );
      }

      // 2. Download and Parse Version JSON
      final versionJsonPath = p.join(versionDir, '$versionId.json');
      final versionData = await _downloadJson(versionJsonUrl, versionJsonPath);

      // 3. Download Client JAR
      onProgress?.call("Descargando client.jar...", 0.1);
      await _downloadClientJar(versionData, versionDir, versionId);

      // 4. Download Libraries
      onProgress?.call("Analizando librerías...", 0.2);
      await _downloadLibraries(versionData, gameDirectory, onProgress);

      // 5. Download Assets (Sounds, Textures)
      onProgress?.call("Analizando assets...", 0.6);
      await _downloadAssets(versionData, gameDirectory, onProgress);

      onProgress?.call("Instalación completada.", 1.0);
      logger.i("Installation of $versionId completed successfully.");
    } catch (e, stack) {
      logger.e(
        "Error installing version $versionId",
        error: e,
        stackTrace: stack,
      );
      rethrow;
    }
  }

  Future<void> installNeoForge({
    required String mcVersion,
    required String neoVersion,
    required String gameDirectory,
    required String javaPath,
    ProgressCallback? onProgress,
  }) async {
    try {
      logger.i("Starting NeoForge installation: $mcVersion - $neoVersion");
      onProgress?.call("Preparando instalador NeoForge...", 0.0);

      // Initialize native API
      final nativeApi = NativeApi();
      nativeApi.init();

      onProgress?.call("Descargando e instalando NeoForge (Rust)...", 0.2);

      // Ensure launcher_profiles.json exists (NeoForge requirement)
      final profilesFile =
          File(p.join(gameDirectory, 'launcher_profiles.json'));
      if (!await profilesFile.exists()) {
        await profilesFile
            .writeAsString('{"profiles": {}, "settings": {}, "version": 3}');
      }

      // Call Rust native function in a background isolate to avoid freezing UI
      final result = await Isolate.run(() async {
        // Re-initialize API in the new isolate if strict, but usually FFI pointers are shareable
        // if we use the same dylib. However, simpler to just pass primitives and let
        // a static helper or fresh init handle it.
        // For simplicity with our current singleton:
        final api = NativeApi();
        api.init(); // Ensure init in this isolate
        return api.installNeoForge(
          neoVersion: neoVersion,
          gameDir: gameDirectory,
          javaPath: javaPath,
        );
      });

      if (result != 1) {
        logger.e("NeoForge Installer Failed with code: $result");
        throw Exception(
          "El instalador de NeoForge falló con código $result",
        );
      }

      onProgress?.call("NeoForge Instalado Correctamente.", 1.0);
      logger.i("NeoForge installed successfully via Rust.");
    } catch (e, stack) {
      logger.e("Error installing NeoForge", error: e, stackTrace: stack);
      rethrow;
    }
  }

  Future<String?> _getVersionJsonUrl(String versionId) async {
    final response = await http.get(Uri.parse(versionManifestUrl));
    if (response.statusCode != 200) throw Exception("Failed to fetch manifest");

    final data = jsonDecode(response.body);
    final versions = data['versions'] as List;

    final version = versions.firstWhere(
      (v) => v['id'] == versionId,
      orElse: () => null,
    );

    return version?['url'];
  }

  Future<Map<String, dynamic>> _downloadJson(
    String url,
    String savePath,
  ) async {
    final file = File(savePath);
    if (await file.exists()) {
      return jsonDecode(await file.readAsString());
    }

    final response = await http.get(Uri.parse(url));
    if (response.statusCode != 200) {
      throw Exception("Failed to download JSON: $url");
    }

    await file.writeAsBytes(response.bodyBytes);
    return jsonDecode(response.body);
  }

  Future<void> _downloadClientJar(
    Map<String, dynamic> versionData,
    String versionDir,
    String versionId,
  ) async {
    final downloads = versionData['downloads'];
    if (downloads != null && downloads['client'] != null) {
      final clientUrl = downloads['client']['url'];
      final clientSha1 = downloads['client']['sha1'];
      final jarPath = p.join(versionDir, '$versionId.jar');

      await _downloadFile(clientUrl, jarPath, expectedSha1: clientSha1);
    }
  }

  Future<void> _downloadLibraries(
    Map<String, dynamic> versionData,
    String gameDir,
    ProgressCallback? onProgress,
  ) async {
    final libraries = versionData['libraries'] as List;
    final total = libraries.length;
    int current = 0;

    for (final lib in libraries) {
      current++;
      // Rules check (OS specific)
      if (!_allowLibrary(lib['rules'])) continue;

      final downloads = lib['downloads'];
      if (downloads == null) continue;

      // Artifact (Normal JAR)
      if (downloads['artifact'] != null) {
        final artifact = downloads['artifact'];
        final path = artifact['path'];
        final url = artifact['url'];
        final sha1 = artifact['sha1'];
        final fullPath = p.join(gameDir, 'libraries', path);

        await _downloadFile(url, fullPath, expectedSha1: sha1);
      }

      // Classifiers (Natives)
      if (downloads['classifiers'] != null) {
        // Simple logic for Windows natives
        if (Platform.isWindows &&
            downloads['classifiers']['natives-windows'] != null) {
          final artifact = downloads['classifiers']['natives-windows'];
          final path = artifact['path'];
          final url = artifact['url'];
          final sha1 = artifact['sha1'];
          final fullPath = p.join(gameDir, 'libraries', path);

          await _downloadFile(url, fullPath, expectedSha1: sha1);
        }
      }

      if (current % 5 == 0) {
        // Update progress periodically
        double p = 0.2 + (0.4 * (current / total)); // 20% to 60%
        onProgress?.call("Descargando librerías ($current/$total)...", p);
      }
    }
  }

  Future<void> _downloadAssets(
    Map<String, dynamic> versionData,
    String gameDir,
    ProgressCallback? onProgress,
  ) async {
    final assetIndex = versionData['assetIndex'];
    final indexUrl = assetIndex['url'];
    final indexId = assetIndex['id'];

    final indexesDir = p.join(gameDir, 'assets', 'indexes');
    await Directory(indexesDir).create(recursive: true);

    final indexJsonPath = p.join(indexesDir, '$indexId.json');
    final indexData = await _downloadJson(indexUrl, indexJsonPath);

    final objects = indexData['objects'] as Map<String, dynamic>;
    final total = objects.length;
    int current = 0;

    final objectsDir = p.join(gameDir, 'assets', 'objects');

    // Process assets in parallel batches for speed
    // Dart's http client is efficient, but we limit concurrency
    final entries = objects.entries.toList();
    const batchSize = 10;

    for (var i = 0; i < entries.length; i += batchSize) {
      final batch = entries.skip(i).take(batchSize);
      await Future.wait(
        batch.map((entry) async {
          final hash = entry.value['hash'];
          final subDir = hash.substring(0, 2);
          final url = "https://resources.download.minecraft.net/$subDir/$hash";
          final savePath = p.join(objectsDir, subDir, hash);

          await _downloadFile(url, savePath, expectedSha1: hash);
        }),
      );

      current += batch.length;
      if (current % 50 == 0) {
        double p = 0.6 + (0.4 * (current / total)); // 60% to 100%
        onProgress?.call("Descargando assets ($current/$total)...", p);
      }
    }
  }

  // Helper: Rules Processor
  bool _allowLibrary(List<dynamic>? rules) {
    if (rules == null) return true;

    bool allow = false;
    for (final rule in rules) {
      if (rule['action'] == 'allow') {
        if (rule['os'] == null) {
          allow = true;
        } else if (rule['os']['name'] == 'windows' && Platform.isWindows) {
          allow = true;
        }
      } else if (rule['action'] == 'disallow') {
        if (rule['os']['name'] == 'windows' && Platform.isWindows) {
          return false;
        }
      }
    }
    return allow;
  }

  // Helper: File Downloader with SHA1 check
  Future<void> _downloadFile(
    String url,
    String savePath, {
    String? expectedSha1,
  }) async {
    final file = File(savePath);
    if (await file.exists()) {
      if (expectedSha1 != null) {
        final digest = sha1.convert(await file.readAsBytes());
        if (digest.toString() == expectedSha1) return; // File is valid
      } else {
        return; // File exists, no hash to check, assume valid
      }
    }

    await file.parent.create(recursive: true);
    final response = await http.get(Uri.parse(url));
    if (response.statusCode != 200) throw Exception("Failed to download $url");

    await file.writeAsBytes(response.bodyBytes);
  }

  /// Returns a record with (mainClass, classpath, gameArgs, jvmArgs)
  Future<LaunchInfo> getLaunchInfo(String versionId, String gameDir) async {
    final versionFile = File(
      p.join(gameDir, 'versions', versionId, '$versionId.json'),
    );
    if (!await versionFile.exists()) {
      throw Exception("Version JSON not found: $versionId");
    }

    final data = jsonDecode(await versionFile.readAsString());

    // 1. Main Class
    final mainClass = data['mainClass'] as String;

    // 2. Classpath
    final libraries = data['libraries'] as List;
    final classpath = <String>[];

    // Add libraries
    for (final lib in libraries) {
      if (!_allowLibrary(lib['rules'])) continue;

      // Handle "downloads" (Vanilla style)
      if (lib['downloads'] != null && lib['downloads']['artifact'] != null) {
        final path = lib['downloads']['artifact']['path'];
        classpath.add(p.join(gameDir, 'libraries', path));
      }
      // Handle "name" (Maven style - Forge/NeoForge often just give name)
      else if (lib['name'] != null) {
        final mavenPath = _mavenPath(lib['name']);
        classpath.add(p.join(gameDir, 'libraries', mavenPath));
      }
    }

    // 3. Arguments
    List<String> gameArgs = [];
    List<String> jvmArgs = [];

    // Add Client Jar (Vanilla) - Check if it inherits from another version
    // NeoForge usually inherits from Vanilla.
    if (data['inheritsFrom'] != null) {
      final parentId = data['inheritsFrom'];
      final parentInfo = await getLaunchInfo(parentId, gameDir);
      classpath.addAll(parentInfo.classpath);
      
      // Merge Game arguments (e.g. --version, --assetsDir from Vanilla)
      gameArgs.addAll(parentInfo.gameArgs);

      // Note: We usually DO NOT merge JVM args because the modloader (child)
      // often specifies its own Main Class and JVM configuration (BootstrapLauncher).
    } else {
      // Vanilla jar
      classpath.add(p.join(gameDir, 'versions', versionId, '$versionId.jar'));
    }

    if (data['arguments'] != null) {
      if (data['arguments']['game'] != null) {
        for (final arg in data['arguments']['game']) {
          if (arg is String) gameArgs.add(arg);
          // Ignore complex rules for now
        }
      }
      if (data['arguments']['jvm'] != null) {
        for (final arg in data['arguments']['jvm']) {
          if (arg is String) jvmArgs.add(arg);
          // Ignore complex rules for now
        }
      }
    } else if (data['minecraftArguments'] != null) {
      // Old style
      gameArgs.addAll((data['minecraftArguments'] as String).split(' '));
    }

    return LaunchInfo(
      mainClass: mainClass,
      classpath: classpath,
      gameArgs: gameArgs,
      jvmArgs: jvmArgs,
    );
  }

  String _mavenPath(String libName) {
    final parts = libName.split(':');
    final group = parts[0].replaceAll('.', '/');
    final artifact = parts[1];
    final version = parts[2];
    // Check if classifier exists
    final classifier = parts.length > 3 ? "-${parts[3]}" : "";
    return "$group/$artifact/$version/$artifact-$version$classifier.jar";
  }
}

class LaunchInfo {
  final String mainClass;
  final List<String> classpath;
  final List<String> gameArgs;
  final List<String> jvmArgs;

  LaunchInfo({
    required this.mainClass,
    required this.classpath,
    required this.gameArgs,
    required this.jvmArgs,
  });
}
