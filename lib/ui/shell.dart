import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:window_manager/window_manager.dart';
import 'theme.dart';
import 'pages/home_page.dart';
import 'pages/settings_page.dart';

class CrystalShell extends StatefulWidget {
  final Widget?
      child; // Keeping for compatibility, but moving to internal navigation

  const CrystalShell({super.key, this.child});

  @override
  State<CrystalShell> createState() => _CrystalShellState();
}

class _CrystalShellState extends State<CrystalShell> {
  int _activeIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Content Area
          Positioned.fill(
            child: IndexedStack(
              index: _activeIndex,
              children: const [
                HomePage(),
                Placeholder(
                    fallbackHeight: 100,
                    color: Colors.blue), // Store placeholder
                Placeholder(
                    fallbackHeight: 100,
                    color: Colors.green), // Forum placeholder
                SettingsPage(),
              ],
            ),
          ),

          // Sidebar
          Positioned(
            left: 0,
            top: 0,
            bottom: 0,
            child: CrystalSidebar(
              selectedIndex: _activeIndex,
              onIndexChanged: (index) {
                setState(() => _activeIndex = index);
              },
            ),
          ).animate().fadeIn(duration: 800.ms).slideX(begin: -0.1),

          // Custom Title Bar
          const Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: CustomTitleBar(),
          ),
        ],
      ),
    );
  }
}

class CrystalSidebar extends StatefulWidget {
  final int selectedIndex;
  final Function(int) onIndexChanged;

  const CrystalSidebar({
    super.key,
    required this.selectedIndex,
    required this.onIndexChanged,
  });

  @override
  State<CrystalSidebar> createState() => _CrystalSidebarState();
}

class _CrystalSidebarState extends State<CrystalSidebar> {
  @override
  Widget build(BuildContext context) {
    return GlassBox(
      radius: 0,
      blur: 20,
      opacity: 0.08,
      child: Container(
        width: 80,
        decoration: const BoxDecoration(
          border: Border(right: BorderSide(color: CrystalTheme.glassBorder)),
        ),
        child: Column(
          children: [
            const SizedBox(height: 50), // Spacing for TitleBar
            _SidebarIcon(
              icon: Icons.games,
              active: widget.selectedIndex == 0,
              onTap: () => widget.onIndexChanged(0),
            ),
            _SidebarIcon(
              icon: Icons.shopping_bag,
              active: widget.selectedIndex == 1,
              onTap: () => widget.onIndexChanged(1),
            ),
            _SidebarIcon(
              icon: Icons.forum,
              active: widget.selectedIndex == 2,
              onTap: () => widget.onIndexChanged(2),
            ),
            _SidebarIcon(
              icon: Icons.settings,
              active: widget.selectedIndex == 3,
              onTap: () => widget.onIndexChanged(3),
            ),
          ],
        ),
      ),
    );
  }
}

class _SidebarIcon extends StatefulWidget {
  final IconData icon;
  final bool active;
  final VoidCallback onTap;

  const _SidebarIcon({
    required this.icon,
    this.active = false,
    required this.onTap,
  });

  @override
  State<_SidebarIcon> createState() => _SidebarIconState();
}

class _SidebarIconState extends State<_SidebarIcon> {
  bool _isHovering = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovering = true),
      onExit: (_) => setState(() => _isHovering = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: Container(
          height: 70,
          width: 80,
          color: Colors.transparent, // Ensure mouse region works
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Active/Hover Light
              AnimatedContainer(
                duration: 200.ms,
                width: widget.active || _isHovering ? 4 : 0,
                height: 30,
                decoration: BoxDecoration(
                  color: CrystalTheme.blue,
                  boxShadow: [
                    if (widget.active || _isHovering)
                      BoxShadow(
                        color: CrystalTheme.blue.withValues(alpha: 0.5),
                        blurRadius: 10,
                        spreadRadius: 2,
                      ),
                  ],
                ),
              )
                  .animate(target: widget.active ? 1 : 0)
                  .moveX(begin: -40, end: -38),

              Icon(
                widget.icon,
                color: widget.active
                    ? Colors.white
                    : (_isHovering ? Colors.white70 : Colors.white38),
                size: 28,
              ).animate(target: (widget.active || _isHovering) ? 1 : 0).scale(
                  begin: const Offset(1, 1), end: const Offset(1.15, 1.15)),
            ],
          ),
        ),
      ),
    );
  }
}

class CustomTitleBar extends StatelessWidget {
  const CustomTitleBar({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 40,
      child: Row(
        children: [
          // Drag area
          Expanded(
            child: GestureDetector(
              behavior: HitTestBehavior.translucent,
              onPanStart: (details) => windowManager.startDragging(),
              child: Container(
                padding: const EdgeInsets.only(left: 85),
                alignment: Alignment.centerLeft,
                child: Row(
                  children: [
                    const Icon(Icons.auto_awesome,
                        size: 16, color: CrystalTheme.blue),
                    const SizedBox(width: 12),
                    Text(
                      'CRYSTAL TIDES',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 3,
                        color: Colors.white.withValues(alpha: 0.9),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          // Window Controls (The only ones now!)
          const WindowButtons(),
        ],
      ),
    );
  }
}

class WindowButtons extends StatelessWidget {
  const WindowButtons({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _TitleBarButton(
          icon: Icons.remove,
          onTap: () => windowManager.minimize(),
        ),
        _TitleBarButton(
          icon: Icons.crop_square,
          onTap: () async {
            if (await windowManager.isMaximized()) {
              windowManager.unmaximize();
            } else {
              windowManager.maximize();
            }
          },
        ),
        _TitleBarButton(
          icon: Icons.close,
          isClose: true,
          onTap: () => windowManager.close(),
        ),
      ],
    );
  }
}

class _TitleBarButton extends StatefulWidget {
  final IconData icon;
  final VoidCallback onTap;
  final bool isClose;

  const _TitleBarButton({
    required this.icon,
    required this.onTap,
    this.isClose = false,
  });

  @override
  State<_TitleBarButton> createState() => _TitleBarButtonState();
}

class _TitleBarButtonState extends State<_TitleBarButton> {
  bool _isHovering = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovering = true),
      onExit: (_) => setState(() => _isHovering = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: 150.ms,
          width: 45,
          height: 40,
          color: _isHovering
              ? (widget.isClose
                  ? Colors.redAccent.withValues(alpha: 0.8)
                  : Colors.white10)
              : Colors.transparent,
          child: Icon(
            widget.icon,
            size: 16,
            color: _isHovering ? Colors.white : Colors.white54,
          ),
        ),
      ),
    );
  }
}
