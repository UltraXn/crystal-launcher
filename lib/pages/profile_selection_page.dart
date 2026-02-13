import 'package:flutter/material.dart';
import 'package:drift/drift.dart' as drift;
import '../services/database_service.dart';
import '../data/local_database.dart';
import '../theme/app_theme.dart';
import '../widgets/profile_editor_dialog.dart';
import '../utils/logger.dart';

class ProfileSelectionPage extends StatefulWidget {
  const ProfileSelectionPage({super.key});

  @override
  State<ProfileSelectionPage> createState() => _ProfileSelectionPageState();
}

class _ProfileSelectionPageState extends State<ProfileSelectionPage> {
  List<Profile> _profiles = [];
  int? _selectedId;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final profiles = await DatabaseService().getProfiles();
      final settings = await DatabaseService().getSettings();
      if (mounted) {
        setState(() {
          _profiles = profiles;
          _selectedId = settings.selectedProfileId;
          _isLoading = false;
        });
      }
    } catch (e) {
      logger.e("Error loading profiles", error: e);
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _selectProfile(int id) async {
    try {
      await DatabaseService().updateSettings(
        SettingsCompanion(selectedProfileId: drift.Value(id)),
      );
      setState(() => _selectedId = id);
    } catch (e) {
      logger.e("Error selecting profile", error: e);
    }
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
      _loadData();
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
      _loadData();
    }
  }

  Future<void> _deleteProfile(int id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppTheme.background,
        title: const Text("Eliminar Perfil", style: TextStyle(color: Colors.white)),
        content: const Text("¿Estás seguro de que deseas eliminar este perfil?", style: TextStyle(color: Colors.white70)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text("CANCELAR")),
          TextButton(
            onPressed: () => Navigator.pop(context, true), 
            child: const Text("ELIMINAR", style: TextStyle(color: Colors.redAccent))
          ),
        ],
      ),
    );

    if (confirm == true) {
      await DatabaseService().deleteProfile(id);
      _loadData();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                Padding(
                  padding: const EdgeInsets.only(left: 32, top: 48, right: 32, bottom: 8),
                  child: Row(
                    children: [
                      const Text(
                        "Instancias y Perfiles",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const Spacer(),
                      IconButton(
                        onPressed: _createNewProfile,
                        icon: const Icon(Icons.add_circle_outline, color: AppTheme.accent),
                        tooltip: "Nueva Instancia",
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: _profiles.isEmpty
                      ? _buildEmptyState()
                      : GridView.builder(
                          padding: const EdgeInsets.all(24),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 3,
                            crossAxisSpacing: 20,
                            mainAxisSpacing: 20,
                            childAspectRatio: 1.2,
                          ),
                          itemCount: _profiles.length,
                          itemBuilder: (context, index) {
                            final profile = _profiles[index];
                            return _buildProfileCard(profile);
                          },
                        ),
                ),
              ],
            ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.layers_clear_outlined, size: 64, color: Colors.white10),
          const SizedBox(height: 16),
          const Text(
            "No tienes perfiles creados",
            style: TextStyle(color: Colors.white70, fontSize: 18),
          ),
          const SizedBox(height: 12),
          ElevatedButton(
            onPressed: _createNewProfile,
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
            child: const Text("CREAR MI PRIMERA INSTANCIA"),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileCard(Profile profile) {
    final isSelected = profile.id == _selectedId;

    return GestureDetector(
      onTap: () => _selectProfile(profile.id),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isSelected 
              ? AppTheme.accent.withValues(alpha: 0.1) 
              : Colors.white.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? AppTheme.accent : Colors.white12,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.layers_rounded, 
                  color: isSelected ? AppTheme.accent : Colors.white54,
                  size: 28,
                ),
                const Spacer(),
                if (isSelected)
                  const Icon(Icons.check_circle, color: AppTheme.accent, size: 20),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              profile.name,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 4),
            Text(
              "Minecraft ${profile.mcVersion}",
              style: const TextStyle(color: Colors.white54, fontSize: 13),
            ),
            Text(
              "Loader: ${profile.neoForgeVersion}",
              style: const TextStyle(color: Colors.white54, fontSize: 12),
            ),
            const Spacer(),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                IconButton(
                  icon: const Icon(Icons.edit_outlined, size: 18, color: Colors.white38),
                  onPressed: () => _editProfile(profile),
                  tooltip: "Configurar",
                ),
                IconButton(
                  icon: const Icon(Icons.delete_outline, size: 18, color: Color(0x80FF5252)),
                  onPressed: () => _deleteProfile(profile.id),
                  tooltip: "Eliminar",
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
