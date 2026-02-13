import 'dart:async';
import 'package:flutter/material.dart';
import 'package:window_manager/window_manager.dart';
import 'package:logger/logger.dart'; // Added for Level
import 'main_shell.dart';
import 'services/log_service.dart';

void main() async {
  runZonedGuarded(() async {
    WidgetsFlutterBinding.ensureInitialized();
    
    // Catch Flutter Errors
    FlutterError.onError = (FlutterErrorDetails details) {
      FlutterError.presentError(details);
      logService.log("🚨 FLUTTER ERROR", level: Level.error, error: details.exception, stackTrace: details.stack);
    };

    await logService.initialize();
    logService.log("🚀 Starting CrystalTides Installer (v1.2.4-alpha)...");
    
    try {
      logService.log("⚙️ Initializing WindowManager...");
      await windowManager.ensureInitialized();

      // WindowOptions removed (unused)

      // Force window setup explicitly instead of waiting
      logService.log("🪟 Setting window options...");
      try {
        await windowManager.setAsFrameless();
        await windowManager.setResizable(false);
        await windowManager.setHasShadow(false);
        await windowManager.setBackgroundColor(const Color(0xFF1E1E1E));
        await windowManager.setIcon('assets/images/app_icon.png');
        await windowManager.setSize(const Size(800, 500));
        await windowManager.center();
      } catch (e) {
        logService.log("⚠️ Minor window setup error: $e", level: Level.warning);
      }

      logService.log("👁️ Showing window...");
      await windowManager.show();
      await windowManager.focus();
      
      logService.log("🏃 Running App...");
      runApp(const CrystalTidesSMPInstaller());
    } catch (e, stack) {
      logService.log("🔥 CRITICAL INIT ERROR", level: Level.error, error: e, stackTrace: stack);
      // Try to run app anyway so user sees something
      runApp(
        MaterialApp(
          home: Scaffold(
            backgroundColor: Colors.red.shade900,
            body: Center(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Text(
                  "FATAL INSTALLER ERROR:\n$e",
                  style: const TextStyle(color: Colors.white, fontSize: 16), 
                  textAlign: TextAlign.center
                ),
              ),
            ),
          ),
        )
      );
    }
  }, (error, stack) {
    logService.log("☠️ UNCAUGHT ASYNC ERROR", level: Level.error, error: error, stackTrace: stack);
  });
}
