import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'dart:async';
import 'package:window_manager/window_manager.dart';
import 'package:provider/provider.dart';
import 'theme.dart';
import 'pages/home_page.dart';
import 'pages/settings_page.dart';
import '../../services/auth_service.dart';
import '../../data/database.dart';
import 'pages/login_page.dart';

class _BackgroundCarousel extends StatefulWidget {
  const _BackgroundCarousel();

  @override
  State<_BackgroundCarousel> createState() => _BackgroundCarouselState();
}

class _BackgroundCarouselState extends State<_BackgroundCarousel> {
  int _currentIndex = 0;
  final List<String> _images = [
    'assets/images/backgrounds/hero-bg-1.webp',
    'assets/images/backgrounds/hero-bg-2.webp',
    'assets/images/backgrounds/hero-bg-3.webp',
    'assets/images/backgrounds/hero-bg-4.webp',
    'assets/images/backgrounds/hero-bg-5.webp',
  ];

  late Timer _timer;

  @override
  void initState() {
    super.initState();
    // Rotate every 10 seconds
    _timer = Timer.periodic(const Duration(seconds: 10), (timer) {
      if (mounted) {
        setState(() {
          _currentIndex = (_currentIndex + 1) % _images.length;
        });
      }
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: const Duration(seconds: 2), // Slow, premium fade
      child: Container(
        key: ValueKey<int>(_currentIndex),
        decoration: BoxDecoration(
          image: DecorationImage(
            image: AssetImage(_images[_currentIndex]),
            fit: BoxFit.cover,
            filterQuality: FilterQuality.high,
          ),
        ),
      ),
    );
  }
}

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
      backgroundColor: Colors.black, // Dark base for images
      body: Stack(
        children: [
          // 0. Global Background Carousel
          const Positioned.fill(child: _BackgroundCarousel()),

          // 1. Dark Overlay (Web Aesthetic: Navy @ 85%)
          Positioned.fill(
            child: Container(
              color: CrystalTheme.navy.withValues(alpha: 0.85),
            ),
          ),

          // 2. Content Area
          Positioned.fill(
            child: IndexedStack(
              index: _activeIndex,
              children: const [
                HomePage(),
                Placeholder(
                    fallbackHeight: 100,
                    color: Colors.transparent), // Store placeholder
                Placeholder(
                    fallbackHeight: 100,
                    color: Colors.transparent), // Forum placeholder
                SettingsPage(),
              ],
            ),
          ),

          // 3. Sidebar
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

          // 4. Custom Title Bar
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

            const Spacer(),

            const Padding(
              padding: EdgeInsets.only(bottom: 24.0),
              child: _SidebarAvatar(),
            ),
          ],
        ),
      ),
    );
  }
}

class _SidebarAvatar extends StatelessWidget {
  const _SidebarAvatar();

  void _showAccountManager(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => const _AccountManagerDialog(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.read<AuthService>();

    return StreamBuilder<Account?>(
      stream: auth.watchActiveAccount(),
      builder: (context, snapshot) {
        final account = snapshot.data;
        // Generate a skin face URL or use a placeholder
        // Using Minotar for offline skins based on username
        final imageUrl = account != null
            ? "https://minotar.net/helm/${account.name}/100.png"
            : "https://minotar.net/helm/Steve/100.png"; // Default

        return InkWell(
          onTap: () => _showAccountManager(context),
          borderRadius: BorderRadius.circular(12),
          child: Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white24, width: 2),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.3),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  )
                ],
                image: DecorationImage(
                  image: NetworkImage(imageUrl),
                  fit: BoxFit.cover,
                )),
          )
              .animate(target: account != null ? 1 : 0) // Pulse if logged in
              .shimmer(
                  duration: 2.seconds, delay: 5.seconds, color: Colors.white24),
        );
      },
    );
  }
}

class _AccountManagerDialog extends StatelessWidget {
  const _AccountManagerDialog();

  @override
  Widget build(BuildContext context) {
    final auth = context.read<AuthService>();

    return Dialog(
        backgroundColor: Colors.transparent,
        child: GlassBox(
          radius: 20,
          opacity: 0.1,
          blur: 20,
          child: Container(
            width: 350,
            constraints: const BoxConstraints(maxHeight: 500),
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.white10),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text("ACCOUNTS",
                        style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 2)),
                    IconButton(
                        onPressed: () => Navigator.pop(context),
                        icon: const Icon(Icons.close,
                            color: Colors.white54, size: 20)),
                  ],
                ),
                const SizedBox(height: 10),
                const Divider(color: Colors.white10),
                const SizedBox(height: 10),
                Flexible(
                  child: FutureBuilder<List<Account>>(
                    future: auth.getAccounts(),
                    builder: (context, snapshot) {
                      if (!snapshot.hasData) {
                        return const Center(child: CircularProgressIndicator());
                      }

                      final accounts = snapshot.data!;
                      return ListView.separated(
                        shrinkWrap: true,
                        itemCount: accounts.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (ctx, index) {
                          final acc = accounts[index];
                          final isMicrosoft = acc.type == "microsoft";

                          // We need to check active status properly, but for now let's just show them
                          return StreamBuilder<Account?>(
                            stream: auth.watchActiveAccount(),
                            builder: (_, activeSnap) {
                              final isActive = activeSnap.data?.id == acc.id;

                              return Container(
                                decoration: BoxDecoration(
                                  color: isActive
                                      ? CrystalTheme.accent
                                          .withValues(alpha: 0.1)
                                      : Colors.white.withValues(alpha: 0.05),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                      color: isActive
                                          ? CrystalTheme.accent
                                          : Colors.transparent),
                                ),
                                child: ListTile(
                                  leading: Container(
                                    width: 32,
                                    height: 32,
                                    decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(8),
                                        image: DecorationImage(
                                            image: NetworkImage(
                                                "https://minotar.net/helm/${acc.name}/64.png"))),
                                  ),
                                  title: Text(acc.name,
                                      style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13)),
                                  subtitle: Text(
                                      isMicrosoft ? "Microsoft" : "Offline",
                                      style: const TextStyle(
                                          color: Colors.white38, fontSize: 11)),
                                  trailing: isActive
                                      ? const Icon(Icons.check_circle,
                                          color: CrystalTheme.accent, size: 18)
                                      : IconButton(
                                          icon: const Icon(Icons.login,
                                              color: Colors.white24, size: 18),
                                          onPressed: () =>
                                              auth.switchAccount(acc.id),
                                        ),
                                ),
                              );
                            },
                          );
                        },
                      );
                    },
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white10,
                        foregroundColor: Colors.white),
                    onPressed: () {
                      Navigator.pop(context); // Close dialog
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const LoginPage(),
                        ),
                      );
                    },
                    child: const Text("+ ADD ACCOUNT"),
                  ),
                ),
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: TextButton(
                    onPressed: () async {
                      final active = await auth.getActiveAccount();
                      if (active != null) {
                        await auth.logout(active.id);
                      }
                      if (context.mounted) Navigator.pop(context);
                    },
                    child: const Text("Log Out Active Account",
                        style:
                            TextStyle(color: Colors.redAccent, fontSize: 12)),
                  ),
                )
              ],
            ),
          ),
        ));
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
