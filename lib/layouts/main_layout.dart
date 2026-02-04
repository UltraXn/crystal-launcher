import 'package:flutter/material.dart';
import '../pages/settings_page.dart';
import '../pages/mod_manager_page.dart';
import '../services/session_service.dart';
import '../services/update_service.dart';
import '../widgets/update_dialog.dart';
import '../theme/app_theme.dart';

class MainLayout extends StatelessWidget {
  final Widget child;

  const MainLayout({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: ExcludeSemantics(
        child: Row(
          children: [
            // Sidebar Placeholder
            Container(
              width: 80,
              color: AppTheme.surfaceLow,
              child: Column(
                children: [
                  const SizedBox(height: 24),
                  _SidebarItem(icon: Icons.home_rounded, isActive: true),
                  const SizedBox(height: 16),
                  _SidebarItem(icon: Icons.newspaper_rounded),
                  const SizedBox(height: 16),
                  GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const ModManagerPage(),
                        ),
                      );
                    },
                    child: const _SidebarItem(icon: Icons.extension_rounded),
                  ),
                  const SizedBox(height: 16),
                  GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const SettingsPage(),
                        ),
                      );
                    },
                    child: const _SidebarItem(icon: Icons.settings_rounded),
                  ),
                  const SizedBox(height: 16),
                  // Update Notification
                  ListenableBuilder(
                    listenable: UpdateService(),
                    builder: (context, _) {
                      if (!UpdateService().isUpdateAvailable) {
                        return const SizedBox.shrink();
                      }
                      return Tooltip(
                        message:
                            "Nueva versión disponible: ${UpdateService().latestVersion}",
                        child: GestureDetector(
                          onTap: () {
                            _showUpdateDialog(context);
                          },
                          child: Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              color: Colors.orange.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: Colors.orange.withValues(alpha: 0.5),
                              ),
                            ),
                            child: const Icon(
                              Icons.system_update_rounded,
                              color: Colors.orange,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                  const Spacer(),
                  Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: AppTheme.accentLow,
                      shape: BoxShape.circle,
                      border: Border.all(color: AppTheme.accentMid),
                    ),
                    child: IconButton(
                      icon: const Icon(
                        Icons.bolt_rounded,
                        color: AppTheme.accent,
                      ),
                      onPressed: () {
                        // Implementación futura: Lanzar el juego directamente pasando la IP
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Row(
                              children: [
                                Icon(Icons.bolt, color: AppTheme.accent),
                                SizedBox(width: 12),
                                Text("Conectando a CrystalTides... (mc.crystaltidesSMP.net)"),
                              ],
                            ),
                            backgroundColor: Color(0xFF1A1A1A),
                          ),
                        );
                      },
                    ),
                  ),
                  PopupMenuButton<String>(
                    offset: const Offset(60, -40), // Show to the right/up
                    color: const Color(0xFF2A2A2A),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    itemBuilder: (context) => [
                      const PopupMenuItem(
                        value: 'logout',
                        child: Row(
                          children: [
                            Icon(
                              Icons.logout,
                              color: Colors.redAccent,
                              size: 20,
                            ),
                            SizedBox(width: 12),
                            Text(
                              "Cerrar Sesión",
                              style: TextStyle(color: Colors.white),
                            ),
                          ],
                        ),
                      ),
                    ],
                    onSelected: (value) async {
                      if (value == 'logout') {
                        await SessionService().logout();
                      }
                    },
                    child: ListenableBuilder(
                      listenable: SessionService(),
                      builder: (context, _) {
                        final session = SessionService().currentSession;
                        final avatarUrl =
                            session?.linkedCrystalAvatar ?? session?.skinUrl;

                        return CircleAvatar(
                          radius: 20,
                          backgroundColor: Colors.white10,
                          backgroundImage:
                              (avatarUrl != null && avatarUrl.isNotEmpty)
                              ? NetworkImage(avatarUrl)
                              : null,
                          child: (avatarUrl == null || avatarUrl.isEmpty)
                              ? const Icon(Icons.person, color: Colors.white70)
                              : null,
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
            // Main Content
            Expanded(child: child),
          ],
        ),
      ),
    );
  }

  void _showUpdateDialog(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const UpdateDialogWidget(),
    );
  }
}

class _SidebarItem extends StatelessWidget {
  final IconData icon;
  final bool isActive;

  const _SidebarItem({required this.icon, this.isActive = false});

  @override
  Widget build(BuildContext context) {
    final color = isActive
        ? Theme.of(context).colorScheme.tertiary
        : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5);

    return Container(
      width: 48,
      height: 48,
      decoration: isActive
          ? BoxDecoration(
              color: Colors.white.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            )
          : null,
      child: Icon(icon, color: color),
    );
  }
}
