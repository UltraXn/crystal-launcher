import 'package:flutter/material.dart';
import '../pages/settings_page.dart';
import '../services/session_service.dart';

class MainLayout extends StatelessWidget {
  final Widget child;

  const MainLayout({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          // Sidebar Placeholder
          Container(
            width: 80,
            color: Theme.of(
              context,
            ).colorScheme.surfaceContainerHighest.withValues(alpha: 0.1),
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
                        builder: (context) => const SettingsPage(),
                      ),
                    );
                  },
                  child: const _SidebarItem(icon: Icons.settings_rounded),
                ),
                const Spacer(),
                PopupMenuButton<String>(
                  offset: const Offset(60, -40), // Show to the right/up
                  color: const Color(0xFF2A2A2A),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  tooltip: 'Menú de Usuario',
                  itemBuilder: (context) => [
                    const PopupMenuItem(
                      value: 'logout',
                      child: Row(
                        children: [
                          Icon(Icons.logout, color: Colors.redAccent, size: 20),
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
                  child: const CircleAvatar(
                    radius: 20,
                    backgroundColor: Colors.white10,
                    child: Icon(Icons.person, color: Colors.white70),
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
              color: Theme.of(
                context,
              ).colorScheme.tertiary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            )
          : null,
      child: Icon(icon, color: color),
    );
  }
}
