import 'package:flutter/material.dart';
import 'package:launcher/widgets/play_button_hero.dart';
import 'package:launcher/theme/app_theme.dart';
import 'package:launcher/widgets/skin_viewer_widget.dart';
import '../services/news_service.dart';
import '../models/news_post.dart';
import '../widgets/news_card.dart';
import '../services/session_service.dart'; // Import SessionService

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final NewsService _newsService = NewsService();
  late Future<List<NewsPost>> _newsFuture;
  UserSession? _session;

  @override
  void initState() {
    super.initState();
    _newsFuture = _newsService.getNews();
    _session = SessionService().currentSession; // Get current session
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Background Image (Placeholder)
        Positioned.fill(
          child: Image.asset(
            "assets/images/backgrounds/launcher_bg.webp",
            fit: BoxFit.cover,
            errorBuilder: (_, _, ___) => Container(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment.topRight,
                  radius: 1.5,
                  colors: [
                    AppTheme.backgroundAlt.withOpacity(0.3),
                    AppTheme.background,
                  ],
                ),
              ),
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
                  AppTheme.background.withOpacity(0.8),
                  AppTheme.background,
                ],
                stops: const [0.0, 0.7, 1.0],
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
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white10,
                      border: Border.all(
                        color: AppTheme.accent.withOpacity(0.5),
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
                  const SizedBox(width: 12),
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
                          color: AppTheme.text.withOpacity(0.6),
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
                        const PlayButtonHero(),
                        const SizedBox(height: 48),

                        // News Section Title
                        Text(
                          "ÚLTIMAS NOTICIAS",
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.9),
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1,
                          ),
                        ),
                        const SizedBox(height: 16),

                        // News Horizontal List
                        SizedBox(
                          height: 240,
                          child: FutureBuilder<List<NewsPost>>(
                            future: _newsFuture,
                            builder: (context, snapshot) {
                              if (snapshot.connectionState ==
                                  ConnectionState.waiting) {
                                return const Center(
                                  child: CircularProgressIndicator(),
                                );
                              }

                              final news = snapshot.data ?? [];
                              if (news.isEmpty) {
                                return const Center(
                                  child: Text("No hay noticias disponibles"),
                                );
                              }

                              return ListView.builder(
                                scrollDirection: Axis.horizontal,
                                itemCount: news.length,
                                itemBuilder: (context, index) {
                                  return NewsCard(news: news[index]);
                                },
                              );
                            },
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
                      // We can pass the skin URL here later if SkinViewerWidget is updated
                      child: const SkinViewerWidget(),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
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
