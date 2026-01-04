import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import '../../native_bridge.dart';
import '../../data/database.dart';
import '../../services/launch_service.dart';
import '../../services/minecraft_engine.dart';
import '../theme.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  late NativeBridge _bridge;
  String _status = "Initializing...";
  String _hash = "";
  String _launchStatus = "";
  double _launchProgress = 0;
  bool _isLaunching = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _bridge = Provider.of<NativeBridge>(context, listen: false);
    _checkBridge();
  }

  Future<void> _checkBridge() async {
    bool success = false;
    try {
      success = _bridge.init();
    } catch (e) {
      debugPrint("Bridge Init Failed: $e");
    }

    if (mounted) {
      setState(() {
        _status = success ? "Bridge Online" : "Bridge offline (check DLL)";
      });

      if (success) {
        final hash = _bridge.calculateSha1("FRANKENSTEIN_CORE");
        // Test Lua Hot-Patching
        final luaTest =
            _bridge.executeLua('return "LUA PATCH v1.0 ACTIVE: " .. (10 + 20)');
        setState(() {
          _hash = hash;
          _status =
              luaTest; // Temporarily show Lua result in status for testing
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            CrystalTheme.navy,
            Color(0xFF0C1425),
            CrystalTheme.navy,
          ],
        ),
      ),
      child: Stack(
        children: [
          // Animated Background Accents
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 400,
              height: 400,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: CrystalTheme.blue.withValues(alpha: 0.1),
              ),
            ),
          )
              .animate(onPlay: (controller) => controller.repeat(reverse: true))
              .move(
                  begin: const Offset(0, 0),
                  end: const Offset(50, 50),
                  duration: 10.seconds),

          // Main Content
          Padding(
            padding: const EdgeInsets.fromLTRB(
                120, 80, 40, 40), // Left padding for sidebar
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "WELCOME TO",
                  style: TextStyle(
                    color: CrystalTheme.blue,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 4,
                    fontSize: 14,
                  ),
                ).animate().fadeIn(delay: 200.ms).slideX(),

                const Text(
                  "CRYSTAL TIDES",
                  style: TextStyle(
                    fontSize: 64,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -2,
                    color: Colors.white,
                  ),
                )
                    .animate()
                    .fadeIn(delay: 400.ms)
                    .scale(begin: const Offset(0.9, 0.9)),

                const SizedBox(height: 10),
                _StatusChip(status: _status, hash: _hash)
                    .animate()
                    .fadeIn(delay: 600.ms),

                const Spacer(),

                // Action Bar
                GlassBox(
                  blur: 25,
                  opacity: 0.1,
                  radius: 20,
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text("READY TO PLAY",
                                style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 18,
                                    color: Colors.white)),
                            Text("Version 1.25.4 - Pre-release",
                                style: TextStyle(
                                    color: Colors.white54, fontSize: 13)),
                          ],
                        ),

                        // Launch Button with Glow
                        Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (_isLaunching)
                              Padding(
                                padding: const EdgeInsets.only(bottom: 12),
                                child: Column(
                                  children: [
                                    Text(_launchStatus.toUpperCase(),
                                        style: const TextStyle(
                                            color: CrystalTheme.blue,
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                            letterSpacing: 1.5)),
                                    const SizedBox(height: 8),
                                    SizedBox(
                                      width: 150,
                                      height: 4,
                                      child: LinearProgressIndicator(
                                        value: _launchProgress,
                                        backgroundColor: Colors.white10,
                                        valueColor:
                                            const AlwaysStoppedAnimation(
                                                CrystalTheme.blue),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            Container(
                              decoration: BoxDecoration(
                                boxShadow: [
                                  BoxShadow(
                                    color: CrystalTheme.blue.withValues(
                                        alpha: _isLaunching ? 0.1 : 0.3),
                                    blurRadius: 20,
                                    spreadRadius: 2,
                                  ),
                                ],
                              ),
                              child: ElevatedButton(
                                onPressed: _isLaunching
                                    ? null
                                    : () async {
                                        setState(() {
                                          _isLaunching = true;
                                          _launchStatus = "Initializing...";
                                          _launchProgress = 0;
                                        });

                                        final db = context.read<AppDatabase>();
                                        final engine =
                                            context.read<MinecraftEngine>();
                                        final launcher =
                                            context.read<LaunchService>();

                                        try {
                                          final ram =
                                              await db.getSetting("ram_mb") ??
                                                  "4096";
                                          final bridge = await db.getSetting(
                                                      "bridge_enabled") ==
                                                  "true" ||
                                              (await db.getSetting(
                                                      "bridge_enabled") ==
                                                  null);

                                          final classpath = await engine
                                              .prepareVersion("1.21.1",
                                                  onProgress: (task, progress) {
                                            setState(() {
                                              _launchStatus = task;
                                              _launchProgress = progress;
                                            });
                                          });

                                          await launcher.launchGame(
                                            ramMB: ram,
                                            enableBridge: bridge,
                                            classpath: classpath,
                                            mainClass:
                                                "net.minecraft.client.main.Main",
                                          );
                                        } catch (e) {
                                          debugPrint("Launch Error: $e");
                                        } finally {
                                          if (mounted)
                                            setState(
                                                () => _isLaunching = false);
                                        }
                                      },
                                child: Text(_isLaunching
                                    ? "PREPARING..."
                                    : "LAUNCH GAME"),
                              ),
                            )
                                .animate(onPlay: (c) => c.repeat(reverse: true))
                                .shimmer(
                                    duration: 3.seconds, color: Colors.white12),
                          ],
                        ),
                      ],
                    ),
                  ),
                ).animate().fadeIn(delay: 800.ms).slideY(begin: 0.2),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String status;
  final String hash;

  const _StatusChip({required this.status, required this.hash});

  @override
  Widget build(BuildContext context) {
    final bool isOnline =
        status.contains("Online") || status.contains("LUA PATCH");
    final Color statusColor = isOnline ? Colors.greenAccent : Colors.redAccent;

    return GlassBox(
      radius: 20,
      opacity: 0.05,
      blur: 10,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: statusColor,
                boxShadow: [
                  BoxShadow(
                    color: statusColor.withValues(alpha: 0.5),
                    blurRadius: 4,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 10),
            Text(
              status,
              style: TextStyle(
                fontSize: 12,
                color: statusColor,
                fontWeight: FontWeight.bold,
              ),
            ),
            if (hash.isNotEmpty) ...[
              const SizedBox(width: 8),
              const Text("|", style: TextStyle(color: Colors.white24)),
              const SizedBox(width: 8),
              Text(
                "API: ${hash.substring(0, 8)}",
                style: const TextStyle(fontSize: 11, color: Colors.white54),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
