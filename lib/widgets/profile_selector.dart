import 'package:flutter/material.dart';
import 'package:drift/drift.dart' as drift;
import '../services/database_service.dart';
import '../data/local_database.dart';
import 'profile_editor_dialog.dart';
import '../theme/app_theme.dart';

class ProfileSelector extends StatefulWidget {
  const ProfileSelector({super.key});

  @override
  State<ProfileSelector> createState() => _ProfileSelectorState();
}

class _ProfileSelectorState extends State<ProfileSelector> {
  List<Profile> _profiles = [];
  int? _selectedId;

  @override
  void initState() {
    super.initState();
    _loadProfiles();
  }

  Future<void> _loadProfiles() async {
    final profiles = await DatabaseService().getProfiles();
    final settings = await DatabaseService().getSettings();

    if (mounted) {
      setState(() {
        _profiles = profiles;
        _selectedId = settings.selectedProfileId;
      });
    }

    if (_profiles.isNotEmpty && _selectedId == null) {
      // Auto-select first if none selected
      _selectProfile(_profiles.first.id);
    }
  }

  Future<void> _selectProfile(int id) async {
    await DatabaseService().updateSettings(
      SettingsCompanion(selectedProfileId: drift.Value(id)),
    );
    setState(() => _selectedId = id);
  }

  Future<void> _createNewProfile() async {
    final result = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (_) => const ProfileEditorDialog(),
    );

    if (result != null) {
      await DatabaseService().createProfile(
        ProfilesCompanion(
          name: drift.Value(result['name']),
          mcVersion: drift.Value(result['mcVersion']),
          neoForgeVersion: drift.Value(result['neoForgeVersion']),
          gameDir: drift.Value(result['gameDir']),
          minRam: drift.Value(result['minRam']),
          maxRam: drift.Value(result['maxRam']),
          javaArgs: drift.Value(result['javaArgs']),
        ),
      );
      _loadProfiles();
    }
  }

  Future<void> _editProfile(Profile profile) async {
    final result = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (_) => ProfileEditorDialog(
        initialName: profile.name,
        initialMcVersion: profile.mcVersion,
        initialNeoForgeVersion: profile.neoForgeVersion,
        initialGameDir: profile.gameDir,
        initialMinRam: profile.minRam,
        initialMaxRam: profile.maxRam,
        initialJavaArgs: profile.javaArgs,
      ),
    );

    if (result != null) {
      await DatabaseService().updateProfile(
        ProfilesCompanion(
          id: drift.Value(profile.id),
          name: drift.Value(result['name']),
          mcVersion: drift.Value(result['mcVersion']),
          neoForgeVersion: drift.Value(result['neoForgeVersion']),
          gameDir: drift.Value(result['gameDir']),
          minRam: drift.Value(result['minRam']),
          maxRam: drift.Value(result['maxRam']),
          javaArgs: drift.Value(result['javaArgs']),
        ),
      );
      _loadProfiles();
    }
  }

  @override
  Widget build(BuildContext context) {
    final selectedProfile = _profiles.cast<Profile?>().firstWhere(
      (p) => p?.id == _selectedId,
      orElse: () => null,
    );

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.black26,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.settings_system_daydream,
            color: AppTheme.primary,
            size: 20,
          ),
          const SizedBox(width: 12),
          DropdownButton<int>(
            value: _selectedId,
            dropdownColor: const Color(0xFF1E1E1E),
            underline: const SizedBox(),
            icon: const Icon(Icons.arrow_drop_down, color: Colors.white54),
            style: const TextStyle(color: Colors.white, fontSize: 14),
            hint: const Text(
              "Seleccionar Perfil",
              style: TextStyle(color: Colors.white54),
            ),
            items: _profiles
                .map(
                  (p) => DropdownMenuItem(
                    value: p.id,
                    child: Text("${p.name} (${p.mcVersion})"),
                  ),
                )
                .toList(),
            onChanged: (v) {
              if (v != null) _selectProfile(v);
            },
          ),
          const SizedBox(width: 8),
          IconButton(
            icon: const Icon(Icons.edit, size: 18, color: Colors.white54),
            onPressed: selectedProfile != null
                ? () => _editProfile(selectedProfile)
                : null,
            tooltip: "Editar Perfil",
          ),
          IconButton(
            icon: const Icon(
              Icons.add_circle_outline,
              size: 18,
              color: AppTheme.accent,
            ),
            onPressed: _createNewProfile,
            tooltip: "Nuevo Perfil",
          ),
        ],
      ),
    );
  }
}
