import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:drift/drift.dart' as drift;
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
  Profile? _selectedProfile;

  void _showCreateProfileDialog(BuildContext context) {
    final nameController = TextEditingController();
    final versionController =
        TextEditingController(text: "1.21.1"); // Default for now

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: CrystalTheme.cardDark,
        title: const Text("Create Instance",
            style: TextStyle(color: Colors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: "Instance Name",
                labelStyle: TextStyle(color: Colors.white54),
                enabledBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: Colors.white24)),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: versionController,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: "Version (e.g. 1.20.1)",
                labelStyle: TextStyle(color: Colors.white54),
                enabledBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: Colors.white24)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text("Cancel"),
          ),
          ElevatedButton(
            onPressed: () async {
              if (nameController.text.isNotEmpty) {
                final db = context.read<AppDatabase>();
                await db.createProfile(
                  ProfilesCompanion.insert(
                    name: nameController.text,
                    versionId: versionController.text,
                    type: "vanilla",
                    lastPlayed: const drift.Value(null),
                  ),
                );
                if (ctx.mounted) Navigator.pop(ctx);
              }
            },
            child: const Text("Create"),
          ),
        ],
      ),
    );
  }

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
                color: CrystalTheme.accent.withValues(alpha: 0.1),
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
                    color: CrystalTheme.accent,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 4,
                    fontSize: 14,
                  ),
                ).animate().fadeIn(delay: 200.ms).slideX(),
                const SizedBox(height: 20),

                // Official Logo
                Center(
                  child: Image.asset(
                    'assets/images/logo.png',
                    height: 140,
                    filterQuality: FilterQuality.high,
                  ),
                )
                    .animate()
                    .fadeIn(delay: 400.ms)
                    .scale(begin: const Offset(0.9, 0.9)),

                const SizedBox(height: 10),

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
                    child: StreamBuilder<List<Profile>>(
                      stream: context.read<AppDatabase>().watchProfiles(),
                      builder: (context, snapshot) {
                        final profiles = snapshot.data ?? [];
                        final hasProfiles = profiles.isNotEmpty;

                        // Sync selection
                        if (hasProfiles) {
                          if (_selectedProfile == null ||
                              !profiles
                                  .any((p) => p.id == _selectedProfile!.id)) {
                            // Avoid setState during build usually, but for local state sync it's tricky.
                            // Better to just use profiles.first as fallback for display.
                            if (_selectedProfile?.id != profiles.first.id) {
                              Future.microtask(() => setState(
                                  () => _selectedProfile = profiles.first));
                            }
                          }
                        }

                        // Use local or first
                        final effectiveProfile = _selectedProfile ??
                            (hasProfiles ? profiles.first : null);

                        return Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    hasProfiles
                                        ? "READY TO PLAY"
                                        : "BEGIN JOURNEY",
                                    style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 18,
                                        color: Colors.white),
                                  ),
                                  const SizedBox(height: 4),
                                  if (hasProfiles)
                                    DropdownButtonHideUnderline(
                                      child: DropdownButton<Profile>(
                                        value: effectiveProfile,
                                        dropdownColor: CrystalTheme.cardDark,
                                        isDense: true,
                                        icon: const Icon(Icons.arrow_drop_down,
                                            color: CrystalTheme.accent),
                                        items: [
                                          ...profiles
                                              .map((p) => DropdownMenuItem(
                                                    value: p,
                                                    child: Text(
                                                        "${p.name} (${p.versionId})",
                                                        style: const TextStyle(
                                                            color:
                                                                Colors.white70,
                                                            fontSize: 13)),
                                                  )),
                                          const DropdownMenuItem(
                                            value: null,
                                            child: Row(
                                              children: [
                                                Icon(Icons.add,
                                                    size: 14,
                                                    color: CrystalTheme.accent),
                                                SizedBox(width: 5),
                                                Text("New Profile",
                                                    style: TextStyle(
                                                        color:
                                                            CrystalTheme.accent,
                                                        fontSize: 13)),
                                              ],
                                            ),
                                          )
                                        ],
                                        onChanged: (val) {
                                          if (val == null) {
                                            _showCreateProfileDialog(context);
                                          } else {
                                            setState(
                                                () => _selectedProfile = val);
                                          }
                                        },
                                      ),
                                    )
                                  else
                                    Row(
                                      children: [
                                        Image.asset(
                                            'assets/images/server_icon.png',
                                            height: 24,
                                            width: 24),
                                        const SizedBox(width: 8),
                                        const Text(
                                            "Create a profile to get started",
                                            style: TextStyle(
                                                color: Colors.white54,
                                                fontSize: 13)),
                                      ],
                                    )
                                ],
                              ),
                            ),

                            // Launch/Create Button
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
                                                color: CrystalTheme.accent,
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
                                                    CrystalTheme.accent),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                Container(
                                  decoration: BoxDecoration(
                                    boxShadow: [
                                      BoxShadow(
                                        color: CrystalTheme.accent.withValues(
                                            alpha: _isLaunching ? 0.1 : 0.3),
                                        blurRadius: 20,
                                        spreadRadius: 2,
                                      ),
                                    ],
                                  ),
                                  child: ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: hasProfiles
                                          ? CrystalTheme.accent
                                          : Colors.white10,
                                      foregroundColor: hasProfiles
                                          ? Colors.black
                                          : Colors.white,
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 32, vertical: 20),
                                    ),
                                    onPressed: _isLaunching
                                        ? null
                                        : () async {
                                            if (!hasProfiles) {
                                              _showCreateProfileDialog(context);
                                              return;
                                            }

                                            setState(() {
                                              _isLaunching = true;
                                              _launchStatus = "Initializing...";
                                              _launchProgress = 0;
                                            });

                                            final db =
                                                context.read<AppDatabase>();
                                            final engine =
                                                context.read<MinecraftEngine>();
                                            final launcher =
                                                context.read<LaunchService>();

                                            try {
                                              final ram = await db
                                                      .getSetting("ram_mb") ??
                                                  "4096";
                                              final bridge = await db.getSetting(
                                                          "bridge_enabled") ==
                                                      "true" ||
                                                  (await db.getSetting(
                                                          "bridge_enabled") ==
                                                      null);

                                              // Prepare using asset service if needed
                                              final preparation = await engine
                                                  .prepareVersion(
                                                      effectiveProfile!
                                                          .versionId, // Use effective profile version
                                                      onProgress:
                                                          (task, progress) {
                                                setState(() {
                                                  _launchStatus = task;
                                                  _launchProgress = progress;
                                                });
                                              });

                                              // Launch using profile settings
                                              // We need to implement profile-specific settings later, for now use global/default
                                              await launcher.launchGame(
                                                version:
                                                    effectiveProfile.versionId,
                                                assetIndex:
                                                    preparation.assetIndex,
                                                ramMB: ram,
                                                enableBridge: bridge,
                                                classpath:
                                                    preparation.classpath,
                                                mainClass:
                                                    "net.minecraft.client.main.Main",
                                              );
                                            } catch (e) {
                                              debugPrint("Launch Error: $e");
                                              if (!context.mounted) return;

                                              ScaffoldMessenger.of(context)
                                                  .showSnackBar(SnackBar(
                                                      content:
                                                          Text("Error: $e")));
                                            } finally {
                                              if (mounted) {
                                                setState(
                                                    () => _isLaunching = false);
                                              }
                                            }
                                          },
                                    child: Text(
                                      _isLaunching
                                          ? "PREPARING..."
                                          : (hasProfiles
                                              ? "LAUNCH GAME"
                                              : "CREATE PROFILE"),
                                      style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          letterSpacing: 1),
                                    ),
                                  ),
                                )
                                    .animate(
                                        onPlay: (c) => c.repeat(reverse: true))
                                    .shimmer(
                                        duration: 3.seconds,
                                        color: Colors.white12),
                              ],
                            ),
                          ],
                        );
                      },
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
