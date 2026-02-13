import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../widgets/window_controls.dart';
import '../services/session_service.dart';
import '../services/update_service.dart';
import '../widgets/update_dialog.dart';
import '../theme/app_theme.dart';
import '../pages/home_page.dart';
import '../pages/mod_manager_page.dart';
import '../pages/profile_selection_page.dart';
import '../pages/settings_page.dart';
import '../pages/profile_page.dart';
import '../pages/admin_dashboard_page.dart';
import '../services/launcher_service.dart';

class MainLayout extends StatefulWidget {
  final Widget? child; // Keep for compatibility if needed, but we'll use internal state

  const MainLayout({super.key, this.child});

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  int _selectedIndex = 0;

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: ExcludeSemantics(
        child: Stack(
          children: [
            Row(
              children: [
                // Sidebar
                Container(
                  width: 80,
                  color: AppTheme.surfaceLow,
                  child: Column(
                    children: [
                      const SizedBox(height: 48), // Increased for window controls
                      _SidebarButton(
                        icon: Icons.home_rounded,
                        isActive: _selectedIndex == 0,
                        onTap: () => _onItemTapped(0),
                        tooltip: "Inicio",
                      ),
                      const SizedBox(height: 16),
                      const _SidebarItem(icon: Icons.newspaper_rounded),
                      const SizedBox(height: 16),
                      _SidebarButton(
                        icon: Icons.extension_rounded,
                        isActive: _selectedIndex == 1,
                        onTap: () => _onItemTapped(1),
                        tooltip: "Mods",
                      ),
                      const SizedBox(height: 16),
                      _SidebarButton(
                        icon: Icons.layers_rounded,
                        isActive: _selectedIndex == 2,
                        onTap: () => _onItemTapped(2),
                        tooltip: "Instancias",
                      ),
                      const SizedBox(height: 16),
                      _SidebarButton(
                        icon: Icons.settings_rounded,
                        isActive: _selectedIndex == 3,
                        onTap: () => _onItemTapped(3),
                        tooltip: "Configuración",
                      ),
                      const SizedBox(height: 16),
                      _SidebarButton(
                        icon: Icons.person_rounded,
                        isActive: _selectedIndex == 4,
                        onTap: () => _onItemTapped(4),
                        tooltip: "Perfil",
                      ),
                      const SizedBox(height: 16),
                      ListenableBuilder(
                        listenable: SessionService(),
                        builder: (context, _) {
                          if (!(SessionService().currentSession?.isAdmin ?? false)) {
                            return const SizedBox.shrink();
                          }
                          return _SidebarButton(
                            icon: Icons.admin_panel_settings_rounded,
                            isActive: _selectedIndex == 5,
                            onTap: () => _onItemTapped(5),
                            tooltip: "Admin",
                          );
                        },
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
                              onTap: () => _showUpdateDialog(context),
                              child: Container(
                                width: 48,
                                height: 48,
                                decoration: BoxDecoration(
                                  color: Colors.orange.withValues(alpha: 0.2),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color:
                                        AppTheme.background.withValues(alpha: 0.95),
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
                          onPressed: () async {
                            await LauncherService().launch(
                              context: context,
                              server: "mc.crystaltidesSMP.net",
                            );
                          },
                        ),
                      ),
                      PopupMenuButton<String>(
                        offset: const Offset(60, -40),
                        color: const Color(0xFF2A2A2A),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        itemBuilder: (context) => [
                          const PopupMenuItem(
                            value: 'profile',
                            child: Row(
                              children: [
                                Icon(Icons.person_outline, color: Colors.white, size: 20),
                                SizedBox(width: 12),
                                Text("Mi Perfil", style: TextStyle(color: Colors.white)),
                              ],
                            ),
                          ),
                          const PopupMenuItem(
                            value: 'logout',
                            child: Row(
                              children: [
                                Icon(Icons.logout, color: Colors.redAccent, size: 20),
                                SizedBox(width: 12),
                                Text("Cerrar Sesión", style: TextStyle(color: Colors.white)),
                              ],
                            ),
                          ),
                        ],
                        onSelected: (value) async {
                          if (value == 'logout') {
                            await SessionService().logout();
                          } else if (value == 'profile') {
                            _onItemTapped(4); // Go to Profile
                          }
                        },
                        child: ListenableBuilder(
                          listenable: SessionService(),
                          builder: (context, _) {
                            final session = SessionService().currentSession;
                            final avatarUrl = session?.linkedCrystalAvatar ?? session?.skinUrl;

                            return CircleAvatar(
                              radius: 20,
                              backgroundColor: Colors.white10,
                              backgroundImage: (avatarUrl != null && avatarUrl.isNotEmpty)
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
                Expanded(
                  child: IndexedStack(
                    index: _selectedIndex,
                    children: [
                      _buildPage(0, const HomePage()),
                      _buildPage(1, const ModManagerPage()),
                      _buildPage(2, const ProfileSelectionPage()),
                      _buildPage(3, const SettingsPage()),
                      _buildPage(4, const ProfilePage()),
                      _buildPage(5, const AdminDashboardPage()),
                    ],
                  ),
                ),
              ],
            ),
            // Global Window Controls
            const Positioned(
              top: 0,
              right: 0,
              left: 0,
              child: WindowControls(),
            ),
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

  Widget _buildPage(int index, Widget page) {
    return page
        .animate(target: _selectedIndex == index ? 1 : 0)
        .fadeIn(duration: 250.ms, curve: Curves.easeOut);
  }
}

class _SidebarButton extends StatelessWidget {
  final IconData icon;
  final bool isActive;
  final VoidCallback onTap;
  final String tooltip;

  const _SidebarButton({
    required this.icon,
    required this.isActive,
    required this.onTap,
    required this.tooltip,
  });

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: GestureDetector(
        onTap: onTap,
        child: _SidebarItem(icon: icon, isActive: isActive),
      ),
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
      child: Icon(icon, color: color)
          .animate(target: isActive ? 1 : 0)
          .scale(begin: const Offset(0.9, 0.9), end: const Offset(1.1, 1.1), duration: 150.ms, curve: Curves.easeOutBack)
          .tint(color: color, duration: 150.ms),
    );
  }
}
