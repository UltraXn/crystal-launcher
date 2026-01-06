import 'dart:io';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:path/path.dart' as p;
import 'package:http/http.dart' as http;
import 'download_service.dart';

class AssetService {
  final DownloadService _downloadService;

  AssetService(this._downloadService);

  /// Downloads game assets (sounds, textures, etc.) based on the version details.
  Future<void> downloadAssets(
      Map<String, dynamic> versionDetails, String gameBaseDir,
      {void Function(String section, double progress)? onProgress}) async {
    // 1. Get Asset Index Info
    final assetIndexInfo = versionDetails['assetIndex'];
    if (assetIndexInfo == null) throw "No asset index found for this version.";

    final String indexId = assetIndexInfo['id'];
    final String indexUrl = assetIndexInfo['url'];

    debugPrint("📂 Processing Asset Index: $indexId");

    // 2. Setup Directories
    final assetsDir = p.join(gameBaseDir, 'assets');
    final indexesDir = p.join(assetsDir, 'indexes');
    final objectsDir = p.join(assetsDir, 'objects');

    await Directory(indexesDir).create(recursive: true);
    await Directory(objectsDir).create(recursive: true);

    // 3. Download/Load Index JSON
    final indexFile = File(p.join(indexesDir, '$indexId.json'));
    String indexContent;

    if (!await indexFile.exists()) {
      debugPrint("⬇️ Downloading Asset Index JSON...");
      indexContent = await http.read(Uri.parse(indexUrl));
      await indexFile.writeAsString(indexContent);
    } else {
      indexContent = await indexFile.readAsString();
    }

    // 4. Parse Objects
    final Map<String, dynamic> indexJson = jsonDecode(indexContent);
    final Map<String, dynamic> objects = indexJson['objects'];

    debugPrint("📦 Found ${objects.length} assets to verify/download.");

    // 5. Download Loop
    int processed = 0;
    int total = objects.length;

    // We can use a Future.wait with a semaphore/batching for speed,
    // but for stability let's do sequential or small batches first.
    // Given Dart's async, we can fire off requests but we should throttle.
    // For this MVP, let's keep it simple: synchronous loop to avoid memory spikes.

    for (var entry in objects.entries) {
      final hash = entry.value['hash'];
      final prefix = hash.substring(0, 2);
      final objectPath = p.join(objectsDir, prefix, hash);
      final url = "https://resources.download.minecraft.net/$prefix/$hash";

      if (!await File(objectPath).exists()) {
        // Ensure parent dir exists
        await Directory(p.dirname(objectPath)).create(recursive: true);

        // Use our download service
        // We won't report checking existing files to keep UI "download" bar meaningful
        await _downloadService.downloadFile(url, objectPath);
      }

      processed++;
      if (onProgress != null && processed % 10 == 0) {
        // Notify every 10 files
        onProgress("Downloading Assets", processed / total);
      }
    }
  }
}
