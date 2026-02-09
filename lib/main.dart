import 'dart:io';
import 'package:path/path.dart' as p;
import 'package:flutter/material.dart';
import 'package:window_manager/window_manager.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'services/supabase_service.dart';
import 'services/database_service.dart';
import 'services/session_service.dart';
import 'services/update_service.dart';
import 'services/log_service.dart';
import 'theme/app_theme.dart';
import 'widgets/auth_wrapper.dart';
import 'pages/profile_page.dart';
import 'pages/mod_manager_page.dart';
import 'pages/profile_selection_page.dart';
import 'pages/settings_page.dart';
import 'pages/admin_dashboard_page.dart';

final initializationError = ValueNotifier<String?>(null);

void main(List<String> args) async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // 0. Init LogService
  await logService.initialize();
  logService.log("🚀 Starting CrystalLauncher...");

  // Check for --uninstall flag
  if (args.contains('--uninstall')) {
    logService.log("🗑️ Uninstall flag detected. Starting cleanup...", category: "SYSTEM");
    await _handleUninstallation();
    return;
  }

  // 1. Window Manager
  await windowManager.ensureInitialized();
  WindowOptions windowOptions = const WindowOptions(
    size: Size(1280, 720),
    center: true,
    backgroundColor: Colors.transparent,
    skipTaskbar: false,
    titleBarStyle: TitleBarStyle.hidden,
    title: "CTLauncher",
  );
  await windowManager.waitUntilReadyToShow(windowOptions, () async {
    await windowManager.setIcon('assets/images/app_icon.png');
    await windowManager.show();
    await windowManager.focus();
  });
  logService.log("🪟 Window Manager Ready");

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
    return ValueListenableBuilder<String?>(
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
          builder: (context, child) => ExcludeSemantics(child: child!),
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
    );
  }
}

Future<void> _handleUninstallation() async {
  try {
    // 1. Remove Registry Key
    logService.log("📝 Removing registry entry...", category: "SYSTEM");
    const psCommand = 'Remove-Item -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\CrystalLauncher" -Force -ErrorAction SilentlyContinue';
    await Process.run('powershell', ['-Command', psCommand]);
    
    // 2. Schedule directory deletion
    // Since we are running the executable FROM the directory we want to delete, 
    // we can't delete it immediately.
    // We'll create a small batch script that waits and then deletes the folder.
    final exePath = Platform.resolvedExecutable;
    final installDir = p.dirname(exePath);
    final batchContent = """
@echo off
timeout /t 2 /nobreak > nul
rmdir /s /q "$installDir"
del "%~f0"
""";
    final batchPath = p.join(p.dirname(installDir), "uninstall_cleanup.bat");
    File(batchPath).writeAsStringSync(batchContent);
    
    logService.log("✅ Cleanup scheduled. Exiting...", category: "SYSTEM");
    await Process.start('cmd', ['/c', 'start', '/min', batchPath], runInShell: true);
    exit(0);
  } catch (e) {
    logService.log("❌ Error during uninstallation: $e", level: Level.error, category: "SYSTEM");
    exit(1);
  }
}
