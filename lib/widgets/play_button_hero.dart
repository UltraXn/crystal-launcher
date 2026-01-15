import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../services/session_service.dart';
import '../services/process_runner.dart';
import 'package:path_provider/path_provider.dart';

class PlayButtonHero extends StatelessWidget {
  const PlayButtonHero({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 80,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.primary, AppTheme.backgroundAlt],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primary.withValues(alpha: 0.4),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () async {
            debugPrint("Launching Game...");
            final session = SessionService().currentSession;
            if (session == null) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("Error: No hay sesión activa")),
              );
              return;
            }

            try {
              // Get standard game directory (e.g. AppData/Roaming/.crystaltides)
              final docs = await getApplicationDocumentsDirectory();
              // For now, let's assume it's in a folder named 'client' inside docs
              // In production, this might be %APPDATA%/.crystaltides
              final gameDir = "${docs.path}\\client";

              await ProcessRunner().launchGame(
                username: session.username,
                uuid: session.uuid ?? "00000000-0000-0000-0000-000000000000",
                accessToken: session.accessToken ?? "0",
                gameDirectory: gameDir,
                version: "1.20.1",
              );

              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("¡Lanzando Minecraft!")),
              );
            } catch (e) {
              ScaffoldMessenger.of(
                context,
              ).showSnackBar(SnackBar(content: Text("Error al lanzar: $e")));
            }
          },
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.play_arrow_rounded,
                  size: 48,
                  color: Colors.white,
                ),
                const SizedBox(width: 16),
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "JUGAR",
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 2,
                        color: Colors.white,
                        height: 1,
                      ),
                    ),
                    Text(
                      "CrystalTides 1.20.1",
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.white.withValues(alpha: 0.8),
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
