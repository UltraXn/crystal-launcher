import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:package_info_plus/package_info_plus.dart';
import 'package:crypto/crypto.dart' as crypto;
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'log_service.dart';
import 'supabase_service.dart';

class UpdateService extends ChangeNotifier {
  static final UpdateService _instance = UpdateService._internal();
  factory UpdateService() => _instance;
  UpdateService._internal();

  bool _isUpdateAvailable = false;
  String _latestVersion = '';
  String _updateUrl = '';
  String _remoteHash = ''; // Added
  String? _downloadedPath;

  bool get isUpdateAvailable => _isUpdateAvailable;
  String get latestVersion => _latestVersion;

  Future<void> checkUpdates() async {
    try {
      final packageInfo = await PackageInfo.fromPlatform();
      final currentVersion = packageInfo.version;

      logService.log("🔍 Checking for updates... (Current: $currentVersion)", category: "NETWORK");
      
      if (!SupabaseService().isInitialized) {
        logService.log("⚠️ Supabase not initialized, skipping update check", category: "NETWORK");
        return;
      }

      final response = await SupabaseService().client
          .from('launcher_settings')
          .select('data')
          .eq('id', 'update_config')
          .single();

      if (response.isNotEmpty) {
        final data = response['data'] as Map<String, dynamic>;
        _latestVersion = data['version'];
        _updateUrl = data['url'];
        _remoteHash = data['sha256'] ?? "";

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
      // Strip pre-release suffix (-alpha, -beta, etc.) and build metadata (+N)
      final cleanCurrent = current.split('-').first.split('+').first;
      final cleanLatest = latest.split('-').first.split('+').first;
      List<int> currentParts = cleanCurrent.split('.').map(int.parse).toList();
      List<int> latestParts = cleanLatest.split('.').map(int.parse).toList();

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

      // --- INTEGRITY VERIFICATION ---
      if (_remoteHash.isNotEmpty) {
        logService.log("🛡️ Verifying update integrity (SHA-256)...", category: "NETWORK");
        final bytes = await file.readAsBytes();
        final localHash = crypto.sha256.convert(bytes).toString();

        if (localHash.toLowerCase() != _remoteHash.toLowerCase()) {
          logService.log("❌ Hash mismatch! Update corrupted or tampered.", level: Level.error, category: "NETWORK");
          await file.delete();
          _downloadedPath = null;
          throw Exception("Error de integridad: El archivo descargado no es válido.");
        }
        logService.log("✅ Integrity verified successfully.", category: "NETWORK");
      } else {
        logService.log("⚠️ No remote hash provided for verification.", level: Level.warning, category: "NETWORK");
      }
      
      _downloadedPath = filePath;
      logService.log("✅ Update downloaded to: $filePath", category: "NETWORK");
    } catch (e) {
      logService.log("❌ Error downloading update", level: Level.error, error: e, category: "NETWORK");
      if (_downloadedPath != null) {
        final f = File(_downloadedPath!);
        if (await f.exists()) await f.delete();
        _downloadedPath = null;
      }
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
