import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:package_info_plus/package_info_plus.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import '../utils/logger.dart';

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

      final response = await http.get(Uri.parse(_versionUrl));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _latestVersion = data['launcher_version'];
        _updateUrl = data['launcher_url'];

        if (_isNewerVersion(currentVersion, _latestVersion)) {
          _isUpdateAvailable = true;
          logger.i(
            "Nueva actualización disponible: $_latestVersion (Actual: $currentVersion)",
          );
          notifyListeners();
        }
      }
    } catch (e) {
      logger.e("Error al buscar actualizaciones: $e");
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
      logger.e("Error comparando versiones: $e");
    }
    return false;
  }

  Future<void> downloadUpdate(Function(double) onProgress) async {
    if (!_isUpdateAvailable || _updateUrl.isEmpty) return;

    try {
      final client = http.Client();
      final request = http.Request('GET', Uri.parse(_updateUrl));
      final response = await client.send(request);

      if (response.statusCode != 200) throw Exception("Error al descargar");

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
      logger.i("Actualización descargada en: $filePath");
    } catch (e) {
      logger.e("Error descargando actualización: $e");
      rethrow;
    }
  }

  Future<void> applyUpdate() async {
    if (_downloadedPath == null) return;

    try {
      // Ejecutamos nuestro instalador personalizado de Flutter.
      // No usamos flags silenciosos ya que queremos que el usuario vea la interfaz premium.
      await Process.start(_downloadedPath!, [], mode: ProcessStartMode.detached);
      
      // Cerramos el launcher actual para permitir que el instalador sobrescriba los archivos
      exit(0);
    } catch (e) {
      logger.e("Error al lanzar el instalador: $e");
      rethrow;
    }
  }
}
