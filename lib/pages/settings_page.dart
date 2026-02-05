import 'dart:io';
import 'package:flutter/material.dart';
import 'package:drift/drift.dart' as drift;
import '../services/database_service.dart';
import '../data/local_database.dart';
import '../theme/app_theme.dart';
import 'package:archive/archive_io.dart';
import '../services/session_service.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:package_info_plus/package_info_plus.dart' as pi;
import '../services/update_service.dart';
import '../widgets/update_dialog.dart';
import '../utils/logger.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  // RAM
  double _minRam = 1024;
  double _maxRam = 4096;

  // Java
  final TextEditingController _javaPathController = TextEditingController();

  // Resolution
  final TextEditingController _widthController = TextEditingController(
    text: "1280",
  );
  final TextEditingController _heightController = TextEditingController(
    text: "720",
  );
  bool _fullscreen = false;

  // Account Linking
  final TextEditingController _linkEmailController = TextEditingController();
  final TextEditingController _linkPasswordController = TextEditingController();
  bool _isLinking = false;

  // Admin / Modpack
  final TextEditingController _modpackUrlController = TextEditingController();
  bool get _isAdmin => SessionService().currentSession?.isAdmin ?? false;

  // Version & Connection
  String _mcVersion = '1.21.1';
  String _neoForgeVersion = '2.218';
  bool _autoConnect = true;

  final Map<String, List<String>> _versionMap = {
    "1.21.1": ["2.218"],
    "1.20.1": ["47.1.0", "47.1.3", "47.1.43"],
    "1.19.4": ["45.1.0", "45.1.32"],
    "1.18.2": ["40.2.0", "40.2.10"],
    "1.16.5": ["36.2.34", "36.2.39"], // Fallback for Forge if older
  };

  // Keybindings
  List<Keybinding> _keybindings = [];

  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    try {
      final settings = await DatabaseService().getSettings();
      setState(() {
        _minRam = settings.minRam.toDouble();
        _maxRam = settings.maxRam.toDouble();
        _javaPathController.text = settings.javaPath ?? "";
        _widthController.text = settings.width.toString();
        _heightController.text = settings.height.toString();
        _fullscreen = settings.fullscreen;
        _mcVersion = settings.mcVersion ?? '1.20.1';
        _neoForgeVersion = settings.neoForgeVersion ?? '47.1.0';
        _autoConnect = settings.autoConnect ?? true;
      });

      final keys = await DatabaseService().getAllKeybindings();
      setState(() => _keybindings = keys);
    } catch (e) {
      logger.e("Error loading settings", error: e);
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _saveSettings() async {
    try {
      final companion = SettingsCompanion(
        minRam: drift.Value(_minRam.toInt()),
        maxRam: drift.Value(_maxRam.toInt()),
        javaPath: drift.Value(_javaPathController.text),
        width: drift.Value(int.tryParse(_widthController.text) ?? 1280),
        height: drift.Value(int.tryParse(_heightController.text) ?? 720),
        fullscreen: drift.Value(_fullscreen),
        mcVersion: drift.Value(_mcVersion),
        neoForgeVersion: drift.Value(_neoForgeVersion),
        autoConnect: drift.Value(_autoConnect),
      );

      await DatabaseService().updateSettings(companion);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Configuración guardada correctamente')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al guardar: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text("Configuración"),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(24),
              children: [
                _buildSectionHeader("Memoria (RAM)", Icons.memory),
                const SizedBox(height: 16),
                _buildRamSlider(),

                const SizedBox(height: 32),

                _buildSectionHeader("Java", Icons.coffee),
                const SizedBox(height: 16),
                _buildJavaPathPicker(),

                const SizedBox(height: 32),

                _buildSectionHeader("Resolución", Icons.aspect_ratio),
                const SizedBox(height: 16),
                _buildResolutionInputs(),

                const SizedBox(height: 32),
                _buildSectionHeader("Cuenta CrystalTides", Icons.link),
                const SizedBox(height: 16),
                _buildAccountLinkingSection(),

                const SizedBox(height: 32),
                _buildSectionHeader(
                  "Versión y Conexión",
                  Icons.settings_input_component,
                ),
                const SizedBox(height: 16),
                _buildVersionAndConnection(),

                const SizedBox(height: 32),
                _buildSectionHeader("Atajos de Teclado", Icons.keyboard),
                const SizedBox(height: 16),
                _buildKeybindingsSection(),

                if (_isAdmin) ...[
                  const SizedBox(height: 32),
                  _buildSectionHeader(
                    "Zona Admin (Modpack)",
                    Icons.admin_panel_settings,
                  ),
                  const SizedBox(height: 16),
                  _buildAdminSection(),
                ],

                const SizedBox(height: 32),
                _buildSectionHeader("Sistema", Icons.system_update_rounded),
                const SizedBox(height: 16),
                _buildUpdateSection(),

                const SizedBox(height: 48),

                ElevatedButton.icon(
                  onPressed: _saveSettings,
                  icon: const Icon(Icons.save),
                  label: const Text("GUARDAR CAMBIOS"),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 20),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: AppTheme.accent),
        const SizedBox(width: 12),
        Text(
          title.toUpperCase(),
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 14,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
          ),
        ),
        const SizedBox(width: 12),
        const Expanded(child: Divider(color: Colors.white10)),
      ],
    );
  }

  Widget _buildRamSlider() {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              "Min: ${_minRam.toInt()} MB",
              style: const TextStyle(color: Colors.white),
            ),
            Text(
              "Max: ${_maxRam.toInt()} MB",
              style: const TextStyle(color: Colors.white),
            ),
          ],
        ),
        RangeSlider(
          values: RangeValues(_minRam, _maxRam),
          min: 512,
          max: 16384, // 16GB
          divisions: 31,
          labels: RangeLabels("${_minRam.toInt()} MB", "${_maxRam.toInt()} MB"),
          activeColor: AppTheme.accent,
          inactiveColor: Colors.white12,
          onChanged: (RangeValues values) {
            setState(() {
              _minRam = values.start;
              _maxRam = values.end;
            });
          },
        ),
      ],
    );
  }

  Widget _buildJavaPathPicker() {
    return Row(
      children: [
        Expanded(
          child: TextField(
            controller: _javaPathController,
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              hintText: "Ruta de javaw.exe (Automático)",
              hintStyle: const TextStyle(color: Colors.white30),
              filled: true,
              fillColor: Colors.white.withOpacity(0.05),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
        ),
        const SizedBox(width: 8),
        IconButton(
          onPressed: () {
            // Placeholder: Could open FilePicker
          },
          icon: const Icon(Icons.folder_open, color: Colors.white70),
          tooltip: "Buscar archivo",
        ),
      ],
    );
  }

  Widget _buildAccountLinkingSection() {
    final session = SessionService().currentSession;
    final isLinked = session?.linkedCrystalEmail != null;

    if (isLinked) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.green.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.green.withOpacity(0.3)),
        ),
        child: Row(
          children: [
            const Icon(Icons.check_circle, color: Colors.greenAccent),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      if (session?.linkedCrystalAvatar != null)
                        Padding(
                          padding: const EdgeInsets.only(right: 12),
                          child: CircleAvatar(
                            radius: 12,
                            backgroundImage: NetworkImage(
                              session!.linkedCrystalAvatar ?? '',
                            ),
                          ),
                        ),
                      Expanded(
                        child: Text(
                          "Vinculado como: ${session?.linkedCrystalEmail}",
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  const SizedBox(height: 8),
                  if (session?.linkedCrystalRole != null)
                    Image.asset(
                      _getRankAsset(session!.linkedCrystalRole!),
                      height: 24,
                      errorBuilder: (context, error, stackTrace) => Text(
                        "Rol: ${session.linkedCrystalRole}",
                        style: const TextStyle(
                          color: Colors.white54,
                          fontSize: 11,
                        ),
                      ),
                    ),
                ],
              ),
            ),
            TextButton(
              onPressed: () async {
                // For now just sign out from Supabase and clear linked data
                await SessionService().logout();
                if (mounted) Navigator.pushReplacementNamed(context, '/login');
              },
              child: const Text(
                "Cerrar Sesión",
                style: TextStyle(color: Colors.redAccent),
              ),
            ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            "Vincula tu cuenta para sincronizar tu progreso y activar tu ról de staff en el launcher.",
            style: TextStyle(color: Colors.white70, fontSize: 12),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _linkEmailController,
            style: const TextStyle(color: Colors.white, fontSize: 13),
            decoration: InputDecoration(
              labelText: "Correo CrystalTides",
              labelStyle: const TextStyle(color: Colors.white54),
              filled: true,
              fillColor: Colors.black26,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _linkPasswordController,
            obscureText: true,
            style: const TextStyle(color: Colors.white, fontSize: 13),
            decoration: InputDecoration(
              labelText: "Contraseña",
              labelStyle: const TextStyle(color: Colors.white54),
              filled: true,
              fillColor: Colors.black26,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _isLinking ? null : _handleLinkAccount,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.accent,
              foregroundColor: Colors.black,
            ),
            child: _isLinking
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text(
                    "VINCULAR CUENTA",
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
          ),
        ],
      ),
    );
  }

  Future<void> _handleLinkAccount() async {
    final email = _linkEmailController.text.trim();
    final password = _linkPasswordController.text.trim();

    if (email.isEmpty || password.isEmpty) return;

    setState(() => _isLinking = true);
    try {
      await SessionService().linkCrystal(email, password);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("✅ Cuenta vinculada correctamente")),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("❌ Error: $e"), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLinking = false);
      }
    }
  }

  String _getRankAsset(String role) {
    final normalized = role.toLowerCase().trim();
    // Map common roles to their specific files if logical
    if (normalized.contains('fundador')) {
      return 'assets/images/ranks/rank-fundador.png';
    }
    if (normalized.contains('neroferno')) {
      return 'assets/images/ranks/rank-neroferno.png';
    }
    if (normalized.contains('killu')) {
      return 'assets/images/ranks/rank-killu.png';
    }
    if (normalized.contains('donador')) {
      return 'assets/images/ranks/rank-donador.png';
    }
    if (normalized.contains('admin')) return 'assets/images/ranks/admin.png';
    if (normalized.contains('mod')) return 'assets/images/ranks/moderator.png';
    if (normalized.contains('helper')) return 'assets/images/ranks/helper.png';
    if (normalized.contains('dev')) return 'assets/images/ranks/developer.png';
    if (normalized.contains('staff')) return 'assets/images/ranks/staff.png';

    // Default fallback locally or generic user
    return 'assets/images/ranks/user.png';
  }

  Widget _buildResolutionInputs() {
    return Row(
      children: [
        Expanded(
          child: TextField(
            controller: _widthController,
            style: const TextStyle(color: Colors.white),
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              labelText: "Ancho",
              labelStyle: const TextStyle(color: Colors.white54),
              filled: true,
              fillColor: Colors.white.withOpacity(0.05),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: TextField(
            controller: _heightController,
            style: const TextStyle(color: Colors.white),
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              labelText: "Alto",
              labelStyle: const TextStyle(color: Colors.white54),
              filled: true,
              fillColor: Colors.white.withOpacity(0.05),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Column(
          children: [
            const Text(
              "Fullscreen",
              style: TextStyle(color: Colors.white54, fontSize: 12),
            ),
            Switch(
              value: _fullscreen,
              activeColor: AppTheme.accent,
              onChanged: (val) => setState(() => _fullscreen = val),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildAdminSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.red.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.red.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "GESTIÓN DEL MODPACK",
            style: TextStyle(
              color: Colors.redAccent,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          ListTile(
            leading: const Icon(Icons.inventory_2, color: Colors.orange),
            title: const Text(
              "1. Generar ZIP local",
              style: TextStyle(color: Colors.white),
            ),
            subtitle: const Text(
              "Comprime 'mods' en 'Desktop/modpack.zip'",
              style: TextStyle(color: Colors.white54, fontSize: 12),
            ),
            onTap: _generateModpackZip,
            tileColor: Colors.white.withOpacity(0.05),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          const SizedBox(height: 8),
          ListTile(
            leading: const Icon(Icons.cloud_upload, color: Colors.blue),
            title: const Text(
              "2. Subir a Drive",
              style: TextStyle(color: Colors.white),
            ),
            subtitle: const Text(
              "Abre drive.google.com para subir el ZIP.",
              style: TextStyle(color: Colors.white54, fontSize: 12),
            ),
            onTap: () => launchUrl(Uri.parse("https://drive.google.com")),
            tileColor: Colors.white.withOpacity(0.05),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            "3. Actualizar Enlace Directo:",
            style: TextStyle(color: Colors.white70),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _modpackUrlController,
            style: const TextStyle(color: Colors.white, fontSize: 13),
            decoration: InputDecoration(
              hintText:
                  "Ej: https://drive.google.com/uc?export=download&id=...",
              hintStyle: const TextStyle(color: Colors.white30),
              filled: true,
              fillColor: Colors.black26,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              suffixIcon: IconButton(
                icon: const Icon(Icons.save_as, color: Colors.greenAccent),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text(
                        "Funcionalidad de guardar URL pendiente de tabla 'app_config'",
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _generateModpackZip() async {
    setState(() => _isLoading = true);
    try {
      // 1. Locate Mods
      // En Dev hardcodeamos para asegurar que apunta a TU carpeta real de Minecraft
      final modsPath = r"c:\Users\nacho\AppData\Roaming\.minecraft\mods";
      final modsDir = Directory(modsPath);

      if (!await modsDir.exists()) {
        throw Exception("No encuentro la carpeta mods en: $modsPath");
      }

      // 2. Create Zip
      final encoder = ZipFileEncoder();
      final tempDir = await getTemporaryDirectory();
      final zipPath = p.join(tempDir.path, 'modpack.zip');

      encoder.create(zipPath);

      // Add all jars
      final files = modsDir.listSync().whereType<File>().where(
        (f) => f.path.endsWith('.jar'),
      );
      int count = 0;
      for (var file in files) {
        encoder.addFile(file);
        count++;
      }
      encoder.close();

      // 3. Move to Desktop (for easy access)
      final desktopPath = r"c:\Users\nacho\Desktop\modpack.zip";
      final targetFile = File(desktopPath);
      if (await targetFile.exists()) {
        await targetFile.delete();
      }
      File(zipPath).copySync(desktopPath);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("✅ Modpack creado con $count mods en Escritorio!"),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("❌ Error: $e"), backgroundColor: Colors.red),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Widget _buildUpdateSection() {
    return ListenableBuilder(
      listenable: UpdateService(),
      builder: (context, _) {
        final isUpdateAvailable = UpdateService().isUpdateAvailable;
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  const Icon(Icons.info_outline, color: Colors.blueAccent, size: 20),
                  const SizedBox(width: 12),
                  FutureBuilder<pi.PackageInfo>(
                    future: pi.PackageInfo.fromPlatform(),
                    builder: (context, snapshot) {
                      final version = snapshot.data?.version ?? "---";
                      return Text(
                        "Versión actual: $version",
                        style: const TextStyle(color: Colors.white70),
                      );
                    },
                  ),
                  const Spacer(),
                  if (isUpdateAvailable)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.orange,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        "DISPONIBLE",
                        style: TextStyle(
                          color: Colors.black,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () async {
                  final messenger = ScaffoldMessenger.of(context);
                  await UpdateService().checkUpdates();
                  if (!mounted) return;
                  if (!UpdateService().isUpdateAvailable) {
                    messenger.showSnackBar(
                      const SnackBar(content: Text("Ya tienes la última versión.")),
                    );
                  }
                },
                icon: const Icon(Icons.refresh_rounded),
                label: const Text("BUSCAR ACTUALIZACIONES"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white12,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
              if (isUpdateAvailable) ...[
                const SizedBox(height: 12),
                ElevatedButton(
                  onPressed: () {
                    // Abrir diálogo de actualización (puedes reutilizar el de MainLayout si lo expones)
                    showDialog(
                      context: context,
                      barrierDismissible: false,
                      builder: (context) => UpdateDialogWidget(),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.orange,
                    foregroundColor: Colors.black,
                  ),
                  child: const Text(
                    "ACTUALIZAR AHORA",
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }

  Widget _buildVersionAndConnection() {
    final availableNeoForge = _versionMap[_mcVersion] ?? [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Text(
              "Versión de Minecraft:",
              style: TextStyle(color: Colors.white70),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _mcVersion,
                    dropdownColor: const Color(0xFF2A2A2A),
                    style: const TextStyle(color: Colors.white),
                    items: _versionMap.keys
                        .map((v) => DropdownMenuItem(value: v, child: Text(v)))
                        .toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setState(() {
                          _mcVersion = val;
                          // Auto-sync NeoForge to the first (default) version of the new MC version
                          _neoForgeVersion = _versionMap[val]?.first ?? "";
                        });
                      }
                    },
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            const Text(
              "Loader (NeoForge/Forge):",
              style: TextStyle(color: Colors.white70),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: availableNeoForge.contains(_neoForgeVersion)
                        ? _neoForgeVersion
                        : (availableNeoForge.isNotEmpty
                              ? availableNeoForge.first
                              : null),
                    dropdownColor: const Color(0xFF2A2A2A),
                    style: const TextStyle(color: Colors.white),
                    items: availableNeoForge
                        .map((v) => DropdownMenuItem(value: v, child: Text(v)))
                        .toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _neoForgeVersion = val);
                    },
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        ListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text(
            "Conexión Directa al Servidor",
            style: TextStyle(color: Colors.white),
          ),
          subtitle: const Text(
            "Se conectará automáticamente a mc.crystaltidesSMP.net",
            style: TextStyle(color: Colors.white54, fontSize: 12),
          ),
          trailing: Switch(
            value: _autoConnect,
            activeColor: AppTheme.accent,
            onChanged: (val) => setState(() => _autoConnect = val),
          ),
        ),
      ],
    );
  }

  Widget _buildKeybindingsSection() {
    if (_keybindings.isEmpty) {
      return const Text(
        "Cargando atajos...",
        style: TextStyle(color: Colors.white24),
      );
    }

    return Column(
      children: _keybindings
          .map((key) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 8.0),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      _getKeybindingLabel(key.action),
                      style: const TextStyle(color: Colors.white70),
                    ),
                  ),
                  GestureDetector(
                    onTap: () => _recordKeybinding(key),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.white10),
                      ),
                      child: Text(
                        key.keyString,
                        style: TextStyle(
                          color: AppTheme.accent,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          })
          .toList()
          .cast<Widget>(),
    );
  }

  String _getKeybindingLabel(String action) {
    switch (action) {
      case 'launch_game':
        return 'Lanzar Juego (F5)';
      case 'open_mods':
        return 'Abrir Mods (Ctrl+M)';
      case 'open_settings':
        return 'Configuración (Ctrl+S)';
      default:
        return action;
    }
  }

  Future<void> _recordKeybinding(Keybinding key) async {
    // Basic implementation: Show a dialog and wait for key?
    // For now, let's just show a snackbar saying it's coming soon or hardcode a toggle
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text("Grabación de teclas interactiva en desarrollo"),
      ),
    );
  }
}
