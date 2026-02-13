import 'dart:io';
import 'package:flutter/material.dart';
import 'package:window_manager/window_manager.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'services/supabase_service.dart';
import 'services/database_service.dart';
import 'services/session_service.dart';
import 'services/update_service.dart';
import 'services/log_service.dart';
import 'services/native_api.dart'; // Added
import 'services/tray_service.dart'; // Added
import 'theme/app_theme.dart';
import 'widgets/tray_listener_wrapper.dart'; // Added
import 'widgets/auth_wrapper.dart';
import 'pages/profile_page.dart';
import 'pages/mod_manager_page.dart';
import 'pages/profile_selection_page.dart';
import 'pages/settings_page.dart';
import 'pages/admin_dashboard_page.dart';
import 'package:flutter/foundation.dart'; // Added for PlatformDispatcher

final initializationError = ValueNotifier<String?>(null);

void main(List<String> args) async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // 0. Init LogService
  await logService.initialize();
  logService.log("🚀 Starting CrystalLauncher...");

  // 0.1 Single Instance Guard (Production Hardening)
  try {
    if (!NativeApi().checkSingleInstance()) {
      logService.log("⚠️ Another instance is already running. Exiting...", level: Level.warning);
      exit(0);
    }
    logService.log("🛡️ Single instance guard active");
  } catch (e) {
    logService.log("⚠️ Could not verify single instance: $e", level: Level.warning);
  }

  // 0.2 Global Error Sentinel
  PlatformDispatcher.instance.onError = (error, stack) {
    logService.log("🚨 UNCAUGHT ASYNC ERROR", level: Level.error, error: error, stackTrace: stack);
    
    // Schedule UI update to avoid "setState during build"
    WidgetsBinding.instance.addPostFrameCallback((_) {
      initializationError.value = "Ocurrió un error inesperado: $error\nConsulta los registros para más detalles.";
    });
    return true; // Mark as handled
  };

  FlutterError.onError = (details) {
    logService.log("🚨 FLUTTER FRAMEWORK ERROR", level: Level.error, error: details.exception, stackTrace: details.stack);
    
    // Mostramos el error en la UI para diagnóstico
    final errorStr = details.exception.toString();
    
    // Schedule UI update to avoid "setState during build"
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (initializationError.value == null || !initializationError.value!.contains(errorStr)) {
        initializationError.value = "Error de Renderizado:\n$errorStr\n\nConsulta los registros para más detalles.";
      }
    });
  };

  // 1. Window Manager
  // 1. Window Manager
  await windowManager.ensureInitialized();
  // WindowOptions removed (unused)
  
  // Force window show explicitly to avoid hanging
  try {
    await windowManager.setAsFrameless(); // Ensure frameless text/icon
    await windowManager.setIcon('assets/images/app_icon.png');
    await windowManager.setSize(const Size(1280, 720));
    await windowManager.center();
  } catch (e) {
    logService.log("⚠️ Minor window setup error: $e", level: Level.warning);
  }
  
  await windowManager.show();
  await windowManager.focus();
  logService.log("🪟 Window Manager Ready (Forced Show)");

  // 2. Load Env
  try {
    await dotenv.load(fileName: ".env");
    logService.log("📄 Env loaded");
  } catch (e) {
    logService.log("⚠️ .env not found or error loading it: $e", level: Level.warning);
  }

  // 3. Init Services
  try {
    logService.log("⚙️ Initializing Core Services...");
    await SupabaseService().initialize();
    logService.log("✅ Supabase service ready");
    await DatabaseService().initialize();
    logService.log("✅ Local Database ready");
    await SessionService().initialize();
    logService.log("✅ Session service ready");
    
    // 4. Tray Service (New)
    try {
      await TrayService().initialize();
    } catch (e) {
      logService.log("⚠️ Tray Service init error: $e", level: Level.warning);
    }

    // No esperamos el check de updates para no bloquear el inicio
    UpdateService().checkUpdates();
    logService.log("🔄 Update check triggered");
  } catch (e, stack) {
    logService.log("⛔ CRITICAL ERROR during initialization", level: Level.error, error: e, stackTrace: stack);
    String errorMessage = e.toString();
    if (errorMessage.contains("NotInitializedError")) {
      errorMessage = "Error: Servicios internos no inicializados correctamente. Verifica tu conexión o contacta a soporte.";
    }
    initializationError.value = errorMessage;
  }

  logService.log("🏁 App Running");
  runApp(const CrystalLauncherApp());
}

class CrystalLauncherApp extends StatelessWidget {
  const CrystalLauncherApp({super.key});

  @override
  Widget build(BuildContext context) {
    return TrayListenerWrapper( // Added Wrapper
      child: ValueListenableBuilder<String?>(
        valueListenable: initializationError,
        builder: (context, error, child) {
          if (error != null) {
            return MaterialApp(
              home: Scaffold(
                backgroundColor: const Color(0xFF121212),
                body: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.error_outline,
                          color: Colors.red,
                          size: 64,
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          "Error de Inicialización",
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          error,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          onPressed: () => logService.openLogs(),
                          icon: const Icon(Icons.description_outlined),
                          label: const Text("ABRIR REGISTROS (LOGS)"),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white10,
                            foregroundColor: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          }
          return MaterialApp(
            title: 'CrystalTides Launcher',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.darkTheme,
            builder: (context, child) => child!,
            home: const AuthWrapper(),
            routes: {
              '/mods': (context) => const ModManagerPage(),
              '/profiles': (context) => const ProfileSelectionPage(),
              '/settings': (context) => const SettingsPage(),
              '/profile': (context) => const ProfilePage(),
              '/admin': (context) => const AdminDashboardPage(),
            },
          );
        },
      ),
    );
  }
}

