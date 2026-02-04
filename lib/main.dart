import 'package:flutter/material.dart';
import 'package:window_manager/window_manager.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'services/supabase_service.dart';
import 'services/database_service.dart';
import 'services/session_service.dart';
import 'services/update_service.dart';
import 'theme/app_theme.dart';
import 'widgets/auth_wrapper.dart';
import 'utils/logger.dart';

final initializationError = ValueNotifier<String?>(null);

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 1. Window Manager
  await windowManager.ensureInitialized();
  WindowOptions windowOptions = const WindowOptions(
    size: Size(1280, 720),
    center: true,
    backgroundColor: Colors.transparent,
    skipTaskbar: false,
    titleBarStyle: TitleBarStyle.hidden,
    title: "CrystalTides Client",
  );
  await windowManager.waitUntilReadyToShow(windowOptions, () async {
    await windowManager.show();
    await windowManager.focus();
  });

  // 2. Load Env
  try {
    await dotenv.load(fileName: ".env");
  } catch (e) {
    logger.w("Warning: .env not found or error loading it: $e");
  }

  // 3. Init Services
  try {
    await SupabaseService().initialize();
    await DatabaseService().initialize();
    await SessionService().initialize();
    // No esperamos el check de updates para no bloquear el inicio
    UpdateService().checkUpdates();
  } catch (e, stack) {
    logger.e("CRITICAL ERROR during initialization: $e", stackTrace: stack);
    initializationError.value = e.toString();
  }

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
        );
      },
    );
  }
}
