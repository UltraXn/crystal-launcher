import 'dart:io';
import 'package:path/path.dart' as p;
import 'package:logger/logger.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter/foundation.dart';

class LogService {
  static final LogService _instance = LogService._internal();
  factory LogService() => _instance;
  LogService._internal();

  File? _logFile;
  
  // Internal logger for console output
  final _logger = Logger(
    printer: PrettyPrinter(
      methodCount: 0,
      errorMethodCount: 5,
      lineLength: 80,
      colors: true,
      printEmojis: true,
    ),
  );

  Future<void> initialize() async {
    try {
      final exeDir = File(Platform.resolvedExecutable).parent.path;
      final logDir = Directory(p.join(exeDir, 'logs'));
      
      if (!await logDir.exists()) {
        await logDir.create(recursive: true);
      }

      final latestLog = File(p.join(logDir.path, 'installer-latest.log'));
      
      if (await latestLog.exists()) {
        await _rotateLog(latestLog, logDir);
      }

      _logFile = latestLog;
      await _logFile!.writeAsString('--- Installer Log Session Started: ${DateTime.now().toIso8601String()} ---\n');

      _logger.i("LogService initialized. Path: ${_logFile!.path}");
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
        newName = File(p.join(logDir.path, "installer-$dateStr-$counter.log"));
        counter++;
      } while (await newName.exists());

      await latestLog.rename(newName.path);
    } catch (e) {
      debugPrint("Error rotating logs: $e");
    }
  }

  Future<void> openLogs() async {
    if (_logFile == null) return;
    
    final Uri uri = Uri.file(_logFile!.parent.path);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      _logger.e("Could not open logs directory: ${uri.toString()}");
    }
  }

  void log(String message, {
    Level level = Level.info, 
    String? category, 
    Object? error, 
    StackTrace? stackTrace
  }) {
    final now = DateTime.now();
    final catTag = category != null ? "[$category] " : "";
    final logLine = "[${now.toIso8601String()}] [${level.name.toUpperCase()}] $catTag$message${error != null ? ' | Error: $error' : ''}\n";
    
    // Write to file if available
    _logFile?.writeAsStringSync(logLine, mode: FileMode.append);
    
    // Console output
    final consoleMessage = "$catTag$message";

    switch (level) {
      case Level.debug:
        _logger.d(consoleMessage, error: error, stackTrace: stackTrace);
        break;
      case Level.info:
        _logger.i(consoleMessage, error: error, stackTrace: stackTrace);
        break;
      case Level.warning:
        _logger.w(consoleMessage, error: error, stackTrace: stackTrace);
        break;
      case Level.error:
        _logger.e(consoleMessage, error: error, stackTrace: stackTrace);
        break;
      default:
        _logger.i(consoleMessage, error: error, stackTrace: stackTrace);
    }
  }
}

final logService = LogService();
