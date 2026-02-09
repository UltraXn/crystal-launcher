import 'dart:io';
import 'package:path/path.dart' as p;
import 'package:logger/logger.dart';
export 'package:logger/logger.dart' show Level;
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter/foundation.dart';
import '../utils/logger.dart';

class LogService {
  static final LogService _instance = LogService._internal();
  factory LogService() => _instance;
  LogService._internal();

  File? _logFile;

  Future<void> initialize() async {
    try {
      // Get directory of the executable
      final exeDir = File(Platform.resolvedExecutable).parent.path;
      final logDir = Directory(p.join(exeDir, 'logs'));
      
      if (!await logDir.exists()) {
        await logDir.create(recursive: true);
      }

      final latestLog = File(p.join(logDir.path, 'latest.log'));
      
      // Rotate if exists
      if (await latestLog.exists()) {
        await _rotateLog(latestLog, logDir);
      }

      _logFile = latestLog;
      await _logFile!.writeAsString('--- Log Session Started: ${DateTime.now().toIso8601String()} ---\n');

      logger.i("LogService initialized. Path: ${_logFile!.path}");
    } catch (e) {
      debugPrint("Warning: Could not initialize file logging: $e");
    }
  }

  Future<void> _rotateLog(File latestLog, Directory logDir) async {
    try {
      final now = DateTime.now();
      final dateStr = "${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}";
      
      int counter = 1;
      File newName;
      do {
        newName = File(p.join(logDir.path, "$dateStr-$counter.log"));
        counter++;
      } while (await newName.exists());

      await latestLog.rename(newName.path);
    } catch (e) {
      debugPrint("Error rotating logs: $e");
    }
  }

  Future<void> openLogs() async {
    if (_logFile == null) return;
    
    // Open the directory containing the logs
    final Uri uri = Uri.file(_logFile!.parent.path);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      logger.e("Could not open logs directory: ${uri.toString()}");
    }
  }

  /// Low-level method to write a line directly to the log file.
  /// Used by the Logger output to avoid recursion.
  void writeToFile(String line) {
    try {
      _logFile?.writeAsStringSync("$line\n", mode: FileMode.append);
    } catch (e) {
      debugPrint("Error writing to log file: $e");
    }
  }

  /// High-level logging method.
  /// This is the primary entry point for manual logging.
  void log(String message, {
    Level level = Level.info, 
    String? category, 
    Object? error, 
    StackTrace? stackTrace
  }) {
    final catTag = category != null ? "[$category] " : "";
    final consoleMessage = "$catTag$message";

    // This calls the global logger, which will eventually call writeToFile via its output
    logger.log(level, consoleMessage, error: error, stackTrace: stackTrace);
  }
}

// Global helper for easier access
final logService = LogService();
