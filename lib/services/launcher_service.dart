import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:drift/drift.dart' hide Column;
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

import '../services/session_service.dart';
import '../services/process_runner.dart';
import '../services/mod_service.dart';
import '../services/database_service.dart';
import '../services/game_installer_service.dart';
import '../services/java_service.dart';
import '../data/local_database.dart';
import '../utils/logger.dart';

class LauncherService {
  static final LauncherService _instance = LauncherService._internal();
  factory LauncherService() => _instance;
  LauncherService._internal();

  /// Launches the game, handling all dependencies (Java, Game, Mods).
  /// [context] is used for showing progress dialogs.
  /// [server] is an optional server IP to connect to automatically.
  Future<void> launch({
    required BuildContext context,
    String? server,
  }) async {
    final session = SessionService().currentSession;
    if (session == null) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Error: No hay sesión activa")),
        );
      }
      return;
    }

    try {
      // 1. Determine Game Directory
      String gameDir;
      String? home = Platform.environment['USERPROFILE'] ?? Platform.environment['HOME'];

      if (home != null) {
        gameDir = p.join(home, '.crystaltides');
      } else if (Platform.isWindows && Platform.environment.containsKey('APPDATA')) {
        gameDir = p.join(Platform.environment['APPDATA']!, '.crystaltides');
      } else {
        final docs = await getApplicationDocumentsDirectory();
        gameDir = p.join(docs.path, '.crystaltides');
      }

      final modsDir = Directory(p.join(gameDir, 'mods'));

      // 2. Get Settings
      final settings = await DatabaseService().getSettings();
      final mcVersion = settings.mcVersion ?? '1.21.1';
      String neoVersion = settings.neoForgeVersion ?? '21.1.219';

      // AUTO-FIX: If legacy invalid version is found, force update
      if (neoVersion == '2.218' || neoVersion == '20.4.80-beta') {
        neoVersion = '21.1.219';
        logger.i("Auto-correcting invalid NeoForge version to $neoVersion");
      }

      // 3. Ensure Java is Configured
      String? effectiveJavaPath = settings.javaPath;
      if (effectiveJavaPath == null || effectiveJavaPath.isEmpty) {
        logger.i("Java path missing. Auto-provisioning via Java Manager...");
        
        if (context.mounted) {
           _showLoadingDialog(context, "Verificando/Instalando Java Runtime...");
        }

        try {
          final reqVersion = JavaService().getJavaVersionForMinecraft(mcVersion);
          effectiveJavaPath = await JavaService().ensureJava(reqVersion);
          
          await DatabaseService().updateSettings(
            SettingsCompanion(javaPath: Value(effectiveJavaPath))
          );
          
          if (context.mounted) Navigator.of(context, rootNavigator: true).pop(); // Close dialog
        } catch (e) {
           logger.e("Failed to setup Java: $e");
           if (context.mounted) {
              Navigator.of(context, rootNavigator: true).pop(); // Close dialog
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error Java: $e")));
           }
           return;
        }
      }

      // 4. Check & Install Game dependencies
      final versionDir = Directory(p.join(gameDir, 'versions', mcVersion));
      final versionsBaseDir = Directory(p.join(gameDir, 'versions'));
      bool neoInstalled = false;
      if (await versionsBaseDir.exists()) {
        final list = await versionsBaseDir.list().toList();
        neoInstalled = list.any((e) => e.path.contains("neoforge"));
      }

      if (!await versionDir.exists() || !neoInstalled) {
        if (!context.mounted) return;

        final progressController = StreamController<String>.broadcast();
        _showProgressDialog(context, "Instalando Minecraft & NeoForge", progressController.stream);

        try {
          await GameInstallerService().installVersion(
            versionId: mcVersion,
            gameDirectory: gameDir,
            onProgress: (status, prog) => progressController.add(status),
          );

          await GameInstallerService().installNeoForge(
            mcVersion: mcVersion,
            neoVersion: neoVersion,
            gameDirectory: gameDir,
            javaPath: effectiveJavaPath,
            onProgress: (status, prog) => progressController.add(status),
          );

          if (context.mounted) Navigator.of(context, rootNavigator: true).pop();
        } catch (e) {
          if (context.mounted) {
            Navigator.of(context, rootNavigator: true).pop();
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error Instalación: $e")));
          }
          return;
        }
      }

      // 5. Check & Sync Modpack
      bool modsNeedUpdate = false;
      if (!await modsDir.exists() || (await modsDir.list().length) == 0) {
        modsNeedUpdate = true;
      } else {
        modsNeedUpdate = await ModService().isUpdateAvailable(gameDir);
      }

      if (modsNeedUpdate) {
        if (!context.mounted) return;

        final progressController = StreamController<String>.broadcast();
        _showProgressDialog(context, "Sincronizando Modpack", progressController.stream);

        try {
          await ModService().syncOfficialMods(
            gameDir,
            onProgress: (name, progress) {
              if (progress > 0 && progress < 1) {
                progressController.add("Descargando: $name (${(progress * 100).toInt()}%)");
              } else {
                progressController.add("Verificando: $name");
              }
            },
          );
          if (context.mounted) Navigator.of(context, rootNavigator: true).pop();
        } catch (e) {
          if (context.mounted) {
            Navigator.of(context, rootNavigator: true).pop();
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error sincronizando mods: $e")));
          }
          return;
        }
      }

      // 6. Launch Actual Game
      await ProcessRunner().launchGame(
        username: session.username,
        uuid: session.uuid ?? "00000000-0000-0000-0000-000000000000",
        accessToken: session.accessToken ?? "0",
        gameDirectory: gameDir,
        version: settings.mcVersion,
        server: server ?? ((settings.autoConnect ?? true) ? "mc.crystaltidesSMP.net" : null),
      );

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("¡Lanzando Minecraft!")),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error al lanzar: $e")));
      }
    }
  }

  void _showLoadingDialog(BuildContext context, String message) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircularProgressIndicator(),
            const SizedBox(height: 16),
            Text(message),
            const Text("(La aplicación puede congelarse unos segundos)", style: TextStyle(fontSize: 10)),
          ],
        ),
      ),
    );
  }

  void _showProgressDialog(BuildContext context, String title, Stream<String> stream) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) {
        return AlertDialog(
          title: Text(title),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const CircularProgressIndicator(),
              const SizedBox(height: 16),
              StreamBuilder<String>(
                stream: stream,
                initialData: "Iniciando...",
                builder: (context, snapshot) {
                  return Text(
                    snapshot.data ?? "Cargando...",
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 13),
                  );
                },
              ),
            ],
          ),
        );
      },
    );
  }
}
