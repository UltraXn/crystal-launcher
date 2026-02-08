import 'dart:io';
import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../services/session_service.dart';
import '../services/process_runner.dart';
import '../services/mod_service.dart';
import 'package:path_provider/path_provider.dart';
import '../utils/logger.dart';

import '../services/database_service.dart';
import 'dart:async';
import '../services/game_installer_service.dart';
import '../services/java_service.dart';

class PlayButtonHero extends StatefulWidget {
  const PlayButtonHero({super.key});

  @override
  State<PlayButtonHero> createState() => _PlayButtonHeroState();
}

class _PlayButtonHeroState extends State<PlayButtonHero> {
  final _progressStream = StreamController<String>.broadcast();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 220, // Fixed smaller width
      height: 50, // Much smaller height (was 80)
      decoration: BoxDecoration(
        color: AppTheme.primary,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () async {
            logger.i("Launching Game...");
            final session = SessionService().currentSession;
            if (session == null) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("Error: No hay sesión activa")),
              );
              return;
            }

            try {
              // Default to .crystaltides in User Home (Like Lunar Client)
              String gameDir;
              String? home =
                  Platform.environment['USERPROFILE'] ??
                  Platform.environment['HOME'];

              if (home != null) {
                gameDir = "$home\\.crystaltides";
              } else if (Platform.isWindows &&
                  Platform.environment.containsKey('APPDATA')) {
                gameDir = "${Platform.environment['APPDATA']}\\.crystaltides";
              } else {
                final docs = await getApplicationDocumentsDirectory();
                gameDir = "${docs.path}\\.crystaltides";
              }

              final modsDir = Directory("$gameDir\\mods");

              // 0. Check & Install Game dependencies
              final settings = await DatabaseService().getSettings();
              final mcVersion = settings.mcVersion ?? '1.21.1';
              String neoVersion = settings.neoForgeVersion ?? '21.1.219';

              // 0.5 Ensure Java is Configured (Critical for both Install and Launch)
              String? effectiveJavaPath = settings.javaPath;
              if (effectiveJavaPath == null || effectiveJavaPath.isEmpty) {
                logger.i(
                    "Java path missing in settings. Attempting auto-discovery...");
                final discovered = await JavaService().findJavaPath();
                if (discovered != null) {
                  logger.i("Java found at: $discovered. Saving to settings.");
                  await JavaService().saveJavaPath(discovered);
                  effectiveJavaPath = discovered;
                } else {
                  // Fallback attempt for 'java' in PATH
                  try {
                    await Process.run('java', ['-version']);
                    logger
                        .i("'java' command found in PATH. Saving as default.");
                    await JavaService().saveJavaPath('java');
                    effectiveJavaPath = 'java';
                  } catch (_) {
                    logger.w("No Java found.");
                  }
                }
              }

              // AUTO-FIX: If legacy invalid version is found, force update
              if (neoVersion == '2.218' || neoVersion == '20.4.80-beta') {
                neoVersion = '21.1.219';
                // Optionally save this back to DB if you want permanent fix,
                // but for now runtime fix is enough to unblock.
                logger.i(
                  "Auto-correcting invalid NeoForge version to $neoVersion",
                );
              }

              // Check if we need to install Vanilla or NeoForge
              final versionDir = Directory("$gameDir\\versions\\$mcVersion");
              // Simplistic check for NeoForge folder
              final neoDirPattern = Directory("$gameDir\\versions");
              bool neoInstalled = false;
              if (await neoDirPattern.exists()) {
                final list = await neoDirPattern.list().toList();
                // Check if any folder contains 'neoforge' and version string
                neoInstalled = list.any((e) => e.path.contains("neoforge"));
              }

              if (!await versionDir.exists() || !neoInstalled) {
                // Open Progress Dialog
                if (!context.mounted) return;

                showDialog(
                  context: context,
                  barrierDismissible: false,
                  builder: (ctx) {
                    return AlertDialog(
                      title: const Text("Instalando Minecraft & NeoForge"),
                      content: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const CircularProgressIndicator(),
                          const SizedBox(height: 16),
                          StreamBuilder<String>(
                            stream: _progressStream.stream,
                            initialData: "Iniciando...",
                            builder: (context, snapshot) {
                              return Text(snapshot.data ?? "Cargando...");
                            },
                          ),
                        ],
                      ),
                    );
                  },
                );

                try {
                  // Install Vanilla
                  await GameInstallerService().installVersion(
                    versionId: mcVersion,
                    gameDirectory: gameDir,
                    onProgress: (status, prog) => _progressStream.add(status),
                  );

                  // Validate Java before Install
                  if (effectiveJavaPath == null) {
                    throw Exception(
                        "Java no está configurado ni instalado. Por favor instala Java 17+.");
                  }

                  await GameInstallerService().installNeoForge(
                    mcVersion: mcVersion,
                    neoVersion: neoVersion,
                    gameDirectory: gameDir,
                    javaPath: effectiveJavaPath,
                    onProgress: (status, prog) => _progressStream.add(status),
                  );

                  if (context.mounted) {
                    Navigator.of(context, rootNavigator: true).pop();
                  }
                } catch (e) {
                  if (context.mounted) {
                    Navigator.of(context, rootNavigator: true).pop();
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text("Error Instalación: $e")),
                    );
                  }
                  return;
                }
              }

              // 1. Check Modpack
              bool needsUpdate = false;
              if (!await modsDir.exists() ||
                  (await modsDir.list().length) == 0) {
                needsUpdate = true;
              } else {
                needsUpdate = await ModService().isUpdateAvailable(gameDir);
              }

              if (needsUpdate) {
                logger.w(
                  "⚠️ Update disponible o mods no encontrados. Iniciando descarga...",
                );

                // Show Download Dialog
                if (!context.mounted) return;

                // Do not await showDialog, or it blocks until closed!
                showDialog(
                  context: context,
                  barrierDismissible: false,
                  builder: (ctx) {
                    return const AlertDialog(
                      title: Text("Sincronizando Mods de CrystalTides"),
                      content: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CircularProgressIndicator(),
                          SizedBox(height: 16),
                          Text("Verificando archivos mediante HASH..."),
                          Text("Solo se descargarán los archivos nuevos o actualizados."),
                        ],
                      ),
                    );
                  },
                );

                try {
                  await ModService().syncOfficialMods(
                    gameDir,
                  );
                  // Success - Close dialog
                  if (context.mounted) {
                    Navigator.of(context, rootNavigator: true).pop();
                  }
                } catch (e) {
                  // Error - Close dialog
                  if (context.mounted) {
                    Navigator.of(context, rootNavigator: true).pop();
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text("Error sincronizando mods: $e")),
                    );
                  }
                  return; // Abort launch
                }
              }

              // 2. Launch
              // final settings = await DatabaseService().getSettings(); // Used from above

              await ProcessRunner().launchGame(
                username: session.username,
                uuid: session.uuid ?? "00000000-0000-0000-0000-000000000000",
                accessToken: session.accessToken ?? "0",
                gameDirectory: gameDir,
                version: settings.mcVersion,
                server: (settings.autoConnect ?? true)
                    ? "mc.crystaltidesSMP.net"
                    : null,
              );

              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("¡Lanzando Minecraft!")),
                );
              }
            } catch (e) {
              if (context.mounted) {
                ScaffoldMessenger.of(
                  context,
                ).showSnackBar(SnackBar(content: Text("Error al lanzar: $e")));
              }
            }
          },
          borderRadius: BorderRadius.circular(8),
          child: const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.play_arrow_rounded,
                  size: 24,
                  color: Colors.white,
                ),
                SizedBox(width: 8),
                Text(
                  "JUGAR",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
