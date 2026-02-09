import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:package_info_plus/package_info_plus.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'log_service.dart';

class UpdateService extends ChangeNotifier {
  static final UpdateService _instance = UpdateService._internal();
  factory UpdateService() => _instance;
  UpdateService._internal();

  static const String _versionUrl =
      'https://raw.githubusercontent.com/UltraXn/CrystalTidesSMP-Project/main/version.json';

  bool _isUpdateAvailable = false;
  String _latestVersion = '';
  String _updateUrl = '';
  String? _downloadedPath;

  bool get isUpdateAvailable => _isUpdateAvailable;
  String get latestVersion => _latestVersion;

  Future<void> checkUpdates() async {
    try {
      final packageInfo = await PackageInfo.fromPlatform();
      final currentVersion = packageInfo.version;

      logService.log("🔍 Checking for updates... (Current: $currentVersion)", category: "NETWORK");
      final response = await http.get(Uri.parse(_versionUrl));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _latestVersion = data['launcher_version'];
        _updateUrl = data['launcher_url'];

        if (_isNewerVersion(currentVersion, _latestVersion)) {
          _isUpdateAvailable = true;
          logService.log("✨ New update available: $_latestVersion", category: "NETWORK");
          notifyListeners();
        } else {
          logService.log("✅ Launcher is up to date", category: "NETWORK");
        }
      }
    } catch (e) {
      logService.log("❌ Error checking for updates", level: Level.error, error: e, category: "NETWORK");
    }
  }

  bool _isNewerVersion(String current, String latest) {
    try {
      List<int> currentParts = current.split('.').map(int.parse).toList();
      List<int> latestParts = latest.split('.').map(int.parse).toList();

      for (int i = 0; i < latestParts.length; i++) {
        int currentPart = i < currentParts.length ? currentParts[i] : 0;
        if (latestParts[i] > currentPart) return true;
        if (latestParts[i] < currentPart) return false;
      }
    } catch (e) {
      logService.log("⚠️ Error comparing versions: $e", level: Level.warning);
    }
    return false;
  }

  Future<void> downloadUpdate(Function(double) onProgress) async {
    if (!_isUpdateAvailable || _updateUrl.isEmpty) return;

    try {
      logService.log("📥 Downloading update from $_updateUrl", category: "NETWORK");
      final client = http.Client();
      final request = http.Request('GET', Uri.parse(_updateUrl));
      final response = await client.send(request);

      if (response.statusCode != 200) throw Exception("Error al descargar: ${response.statusCode}");

      final totalBytes = response.contentLength ?? 0;
      var receivedBytes = 0;

      final tempDir = await getTemporaryDirectory();
      final filePath = p.join(tempDir.path, 'CrystalTides_Update.exe');
      final file = File(filePath);
      final sink = file.openWrite();

      await response.stream.forEach((chunk) {
        receivedBytes += chunk.length;
        if (totalBytes > 0) {
          onProgress(receivedBytes / totalBytes);
        }
        sink.add(chunk);
      });

      await sink.close();
      _downloadedPath = filePath;
      logService.log("✅ Update downloaded to: $filePath", category: "NETWORK");
    } catch (e) {
      logService.log("❌ Error downloading update", level: Level.error, error: e, category: "NETWORK");
      rethrow;
    }
  }

  Future<void> applyUpdate() async {
    if (_downloadedPath == null) return;

    try {
      logService.log("🔄 Applying update: $_downloadedPath", category: "SYSTEM");
      // Ejecutamos nuestro instalador personalizado de Flutter.
      await Process.start(_downloadedPath!, [], mode: ProcessStartMode.detached);
      
      logService.log("👋 Closing launcher for update", category: "SYSTEM");
      exit(0);
    } catch (e) {
      logService.log("❌ Error launching installer", level: Level.error, error: e, category: "SYSTEM");
      rethrow;
    }
  }
}
