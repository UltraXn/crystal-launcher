import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:drift/drift.dart';
import 'package:path/path.dart' as p;
import 'database_service.dart';
import '../data/local_database.dart'; // Import for SettingsCompanion

class JavaService {
  static final JavaService _instance = JavaService._internal();

  factory JavaService() => _instance;

  JavaService._internal();

  /// Tries to find a valid Java executable.
  /// 1. Checks Database setting.
  /// 2. Checks JAVA_HOME environment variable.
  /// 3. Checks common install paths on Windows.
  /// Returns null if no valid Java is found.
  Future<String?> findJavaPath() async {
    // 1. Check DB
    try {
      final settings = await DatabaseService().getSettings();
      if (settings.javaPath != null &&
          await File(settings.javaPath!).exists()) {
        return settings.javaPath;
      }
    } catch (e) {
      debugPrint("Database not ready or error reading settings: $e");
    }

    // 2. Check JAVA_HOME
    String? javaHome = Platform.environment['JAVA_HOME'];
    if (javaHome != null) {
      String path = p.join(javaHome, 'bin', 'javaw.exe');
      if (await File(path).exists()) return path;

      path = p.join(javaHome, 'bin', 'java.exe');
      if (await File(path).exists()) return path;
    }

    // 3. Scan Common Windows Paths (Basic scan)
    final commonPaths = [
      r'C:\Program Files\Java',
      r'C:\Program Files (x86)\Java',
      r'C:\Program Files\Eclipse Adoptium',
      r'C:\Program Files\Microsoft\jdk',
    ];

    for (var root in commonPaths) {
      final dir = Directory(root);
      if (await dir.exists()) {
        try {
          // Look for subdirectories (versions)
          await for (var entity in dir.list()) {
            if (entity is Directory) {
              // Check bin/javaw.exe
              String candidate = p.join(entity.path, 'bin', 'javaw.exe');
              if (await File(candidate).exists()) return candidate;
            }
          }
        } catch (e) {
          debugPrint("Error scanning $root: $e");
        }
      }
    }

    return null;
  }

  Future<void> saveJavaPath(String path) async {
    await DatabaseService().updateSettings(
      SettingsCompanion(javaPath: Value(path)),
    );
  }
}
