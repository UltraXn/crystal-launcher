import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../data/database.dart';
import '../theme.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  final TextEditingController _ramController =
      TextEditingController(text: "4096");
  bool _perfMode = false;
  bool _bridgeEnabled = true;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final db = context.read<AppDatabase>();
    final ram = await db.getSetting("ram_mb");
    final bridge = await db.getSetting("bridge_enabled");
    final perf = await db.getSetting("perf_mode");

    if (mounted) {
      setState(() {
        if (ram != null) _ramController.text = ram;
        if (bridge != null) _bridgeEnabled = bridge == "true";
        if (perf != null) _perfMode = perf == "true";
      });
    }
  }

  Future<void> _saveSetting(String key, String value) async {
    final db = context.read<AppDatabase>();
    await db.updateSetting(key, value);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFF0C1425), // Darker than home for contrast
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(120, 80, 40, 40),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "SETTINGS",
              style: TextStyle(
                fontSize: 48,
                fontWeight: FontWeight.w900,
                letterSpacing: -1,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 40),
            Expanded(
              child: ListView(
                children: [
                  _SettingsSection(
                    title: "GAME SETTINGS",
                    children: [
                      _SettingTile(
                        title: "RAM ALLOCATION (MB)",
                        subtitle: "Recommended: 4096MB - 8192MB",
                        child: SizedBox(
                          width: 120,
                          child: TextField(
                            controller: _ramController,
                            textAlign: TextAlign.right,
                            keyboardType: TextInputType.number,
                            style: const TextStyle(color: CrystalTheme.blue),
                            onChanged: (v) => _saveSetting("ram_mb", v),
                            decoration: const InputDecoration(
                              isDense: true,
                              border: InputBorder.none,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 30),
                  _SettingsSection(
                    title: "APPEARANCE",
                    children: [
                      _SettingTile(
                        title: "PERFORMANCE MODE",
                        subtitle: "Disable heavy blur and animations for FPS.",
                        child: Switch(
                          value: _perfMode,
                          onChanged: (v) {
                            setState(() => _perfMode = v);
                            _saveSetting("perf_mode", v.toString());
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 30),
                  _SettingsSection(
                    title: "EXPERIMENTAL",
                    children: [
                      _SettingTile(
                        title: "GAME-BRIDGE AGENT",
                        subtitle: "Enable in-game HUD and advanced features.",
                        child: Switch(
                          value: _bridgeEnabled,
                          onChanged: (v) {
                            setState(() => _bridgeEnabled = v);
                            _saveSetting("bridge_enabled", v.toString());
                          },
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SettingsSection extends StatelessWidget {
  final String title;
  final List<Widget> children;

  const _SettingsSection({required this.title, required this.children});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            color: CrystalTheme.blue,
            fontWeight: FontWeight.bold,
            letterSpacing: 2,
            fontSize: 12,
          ),
        ),
        const SizedBox(height: 15),
        GlassBox(
          radius: 15,
          opacity: 0.05,
          child: Column(
            children: children,
          ),
        ),
      ],
    );
  }
}

class _SettingTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final Widget child;

  const _SettingTile({
    required this.title,
    required this.subtitle,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
                Text(
                  subtitle,
                  style: const TextStyle(
                    color: Colors.white38,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          child,
        ],
      ),
    );
  }
}
