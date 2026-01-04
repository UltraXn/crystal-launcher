import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'minecraft_service.dart';
import 'download_service.dart';

class MinecraftEngine {
  final MinecraftService _mcService;
  final DownloadService _downloadService;

  MinecraftEngine(this._mcService, this._downloadService);

  Future<List<String>> prepareVersion(String versionId,
      {void Function(String task, double progress)? onProgress}) async {
    debugPrint("📂 Preparing Minecraft $versionId...");

    // 1. Fetch Version List
    final versions = await _mcService.getVersions();
    final version = versions.firstWhere((v) => v.id == versionId);

    // 2. Fetch Version Details
    final details = await _mcService.getVersionDetails(version.url);

    // 3. Setup Directories
    final appDir = await getApplicationSupportDirectory();
    final gameBaseDir = p.join(appDir.path, 'minecraft');
    final versionsDir = p.join(gameBaseDir, 'versions', versionId);
    final librariesDir = p.join(gameBaseDir, 'libraries');

    if (!await Directory(versionsDir).exists())
      await Directory(versionsDir).create(recursive: true);
    if (!await Directory(librariesDir).exists())
      await Directory(librariesDir).create(recursive: true);

    final List<String> classpath = [];

    // 4. Download Client JAR
    final clientUrl = details['downloads']['client']['url'];
    final clientJarPath = p.join(versionsDir, '$versionId.jar');

    if (!await File(clientJarPath).exists()) {
      if (onProgress != null) onProgress("Downloading Client JAR", 0);
      await _downloadService.downloadFile(clientUrl, clientJarPath,
          onProgress: (received, total) {
        if (onProgress != null)
          onProgress("Downloading Client JAR", received / total);
      });
    }
    classpath.add(clientJarPath);

    // 5. Download Libraries (Simplified for testing)
    final List libs = details['libraries'];
    int downloadedLibs = 0;
    for (var lib in libs) {
      final artifact = lib['downloads']['artifact'];
      if (artifact == null) continue; // Skip natives/rules for now

      final libPath = p.join(librariesDir, artifact['path']);
      if (!await File(libPath).exists()) {
        await _downloadService.downloadFile(artifact['url'], libPath);
      }
      classpath.add(libPath);
      downloadedLibs++;
      if (onProgress != null)
        onProgress("Syncing Libraries", downloadedLibs / libs.length);
    }

    return classpath;
  }
}
