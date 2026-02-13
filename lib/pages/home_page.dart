import 'package:flutter/material.dart';
import 'package:launcher/widgets/play_button_hero.dart';
import 'package:launcher/theme/app_theme.dart';
import '../services/session_service.dart';
import '../widgets/profile_selector.dart';
import '../widgets/skin_viewer_widget.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  UserSession? _session;

  @override
  void initState() {
    super.initState();
    _session = SessionService().currentSession; // Get current session
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Background
        Positioned.fill(child: Container(color: AppTheme.background)),
        // Background Image (Overlay)
        Positioned.fill(
          child: Opacity(
            opacity: 0.5,
            child: Image.asset(
              "assets/images/backgrounds/launcher_bg.webp",
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) =>
                  const SizedBox.shrink(),
            ),
          ),
        ),
        // Overlay Gradient
        Positioned.fill(
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.transparent,
                  AppTheme.background.withValues(alpha: 0.8),
                  AppTheme.background,
                ],
              ),
            ),
          ),
        ),

        // Content
        Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  // Avatar / User Info
                  // Avatar removed as per request
                  /* Container(
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white10,
                      border: Border.all(
                        color: Colors.black.withValues(alpha: 0.3),
                      ),
                      image: _session?.skinUrl != null
                          ? DecorationImage(
                              image: NetworkImage(_session!.skinUrl!),
                            ) // 2D Head
                          : null,
                    ),
                    child: _session?.skinUrl == null
                        ? const Icon(Icons.person, color: Colors.white70)
                        : null,
                  ),
                  const SizedBox(width: 12), */
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _session?.username.toUpperCase() ?? "INVITADO",
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          letterSpacing: 1,
                        ),
                      ),
                      Text(
                        _getAuthTypeLabel(_session?.type ?? AuthType.guest),
                        style: TextStyle(
                          color: AppTheme.text.withValues(alpha: 0.6),
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),

                  const Spacer(),
                  // Server Stats Placeholder
                  Container(
                    // ... same stats container ...
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.black45,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white10),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: Colors.greenAccent,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          "47,400 En línea",
                          style: TextStyle(fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const Spacer(),

              // Bottom Action Area
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  // Play Button & News Area
                  Expanded(
                    flex: 2,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const ProfileSelector(),
                        const SizedBox(height: 16),
                        const PlayButtonHero(),
                        const SizedBox(height: 84), // Adjusted spacing
                        Container(
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            color: Colors.black26,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.white10),
                          ),
                          child: const Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "ESTADO DEL SERVIDOR",
                                style: TextStyle(
                                  color: AppTheme.accent,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 2,
                                  fontSize: 12,
                                ),
                              ),
                              SizedBox(height: 8),
                              Text(
                                "El servidor está actualmente en línea y listo para recibir jugadores. ¡Únete a la aventura hoy!",
                                style: TextStyle(
                                  color: Colors.white70,
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(width: 32),

                  // Right Panel (Friends/Skin)
                  Expanded(
                    flex: 1,
                    child: Container(
                      height: 450,
                      decoration: BoxDecoration(
                        color: Colors.black26,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white12),
                      ),
                      // DIAGNOSIS: Commenting out WebView-based widget to isolate white screen
                      child: const SkinViewerWidget(),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        // Window Controls removed as they are now global in MainLayout
      ],
    );
  }

  String _getAuthTypeLabel(AuthType type) {
    switch (type) {
      case AuthType.guest:
        return "Modo Invitado";
      case AuthType.crystal:
        return "Cuenta CrystalTides";
      case AuthType.microsoft:
        return "Premium User";
      case AuthType.none:
        return "Desconocido";
    }
  }
}
