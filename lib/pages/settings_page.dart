
import 'package:flutter/material.dart';
import 'package:drift/drift.dart' as drift;
import '../services/database_service.dart';
import '../data/local_database.dart';
import '../theme/app_theme.dart';
import '../services/session_service.dart';
import 'package:package_info_plus/package_info_plus.dart' as pi;
import '../services/update_service.dart';
import '../services/log_service.dart';
import '../services/two_factor_service.dart';
import '../components/two_factor_prompt.dart';
import '../services/supabase_service.dart';
import '../services/profile_service.dart';
import '../widgets/update_dialog.dart';
import 'package:url_launcher/url_launcher.dart';

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

  // Launcher Config
  bool _minimizeToTray = true;

  // 2FA State
  final TwoFactorService _twoFactorService = TwoFactorService();
  bool _is2FAEnabled = false;
  bool _isLoading2FA = true;
  bool _isUpdatingAvatar = false;

  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadSettings();
    _check2FAStatus();
  }

  Future<void> _check2FAStatus() async {
    // 1. Check local session persistence first
    if (SessionService().currentSession?.isAdminVerified == true) {
      if (mounted) {
        setState(() {
          _is2FAEnabled = true;
          _isLoading2FA = false;
        });
      }
      return;
    }

    // 2. Fallback to API check if not verified locally
    final token = SessionService().currentSession?.accessToken;
    if (token != null) {
      final enabled = await _twoFactorService.checkStatus(token);
      if (mounted) {
        setState(() {
          _is2FAEnabled = enabled; // If API says true (e.g. from backend state), we respect it too
          _isLoading2FA = false;
        });
      }
    } else {
      if (mounted) setState(() => _isLoading2FA = false);
    }
  }

  Future<void> _manualSync() async {
    String? pendingAdminToken;

    final verified = await showDialog<bool>(
      context: context,
      builder: (context) => HeroMode(
        enabled: false,
        child: TwoFactorPrompt(
          onCancel: () => Navigator.pop(context, false),
          onVerify: (code) async {
            String? token = SessionService().currentSession?.accessToken;
            token ??= SupabaseService().client.auth.currentSession?.accessToken;

            if (token == null) return false;
            final adminToken = await _twoFactorService.verify(token, code);

            if (adminToken != null) {
              pendingAdminToken = adminToken;
              if (!context.mounted) return true;
              Navigator.pop(context, true);
              return true;
            }
            return false;
          },
        ),
      ),
    );

    if (verified == true && pendingAdminToken != null) {
      await SessionService().elevateSession(pendingAdminToken!);

      if (mounted) {
        setState(() => _is2FAEnabled = true);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Sincronización manual exitosa. 2FA Activado."),
            backgroundColor: Colors.green,
          ),
        );
      }
    }
  }

  Future<void> _updateProfilePicture() async {
    setState(() => _isUpdatingAvatar = true);
    try {
      final newUrl = await ProfileService().pickAndUploadAvatar();
      if (newUrl != null && mounted) {
        await SessionService().refreshLinkedData();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text("✅ Foto de perfil actualizada con éxito."),
              backgroundColor: Colors.green,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text("❌ Error al actualizar avatar: $e"),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isUpdatingAvatar = false);
    }
  }

  Future<void> _loadSettings() async {
    try {
      final settings = await DatabaseService().getSettings();
      if (mounted) {
        setState(() {
          _minRam = settings.minRam.toDouble();
          _maxRam = settings.maxRam.toDouble();
          _javaPathController.text = settings.javaPath ?? "";
          _heightController.text = settings.height.toString();
          _fullscreen = settings.fullscreen;
          _minimizeToTray = settings.minimizeToTray;
        });
      }
    } catch (e) {
      logService.log("Error loading settings", error: e, level: Level.error);
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
        minimizeToTray: drift.Value(_minimizeToTray),
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
      backgroundColor: Colors.transparent, // Use container background if needed
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

                _buildSectionHeader("Cuenta CrystalTides", Icons.link),
                const SizedBox(height: 16),
                _buildAccountLinkingSection(),

                const SizedBox(height: 16),
                if (SessionService().currentSession != null && 
                    (SessionService().currentSession!.type == AuthType.crystal || 
                     SessionService().currentSession!.linkedCrystalEmail != null))
                  _buildProfileManagementSection(),

                const SizedBox(height: 32),
                _buildSectionHeader("Seguridad (2FA)", Icons.security),
                const SizedBox(height: 16),
                _buildTwoFactorSection(),

                const SizedBox(height: 32),
                _buildSectionHeader("Launcher", Icons.desktop_windows),
                const SizedBox(height: 16),
                _buildLauncherConfigSection(),

                const SizedBox(height: 32),
                _buildSectionHeader("Sistema", Icons.system_update_rounded),
                const SizedBox(height: 16),
                _buildUpdateSection(),
                const SizedBox(height: 16),
                ListTile(
                  leading: const Icon(Icons.description_outlined, color: Colors.white70),
                  title: const Text("Ver Registros (Logs)", style: TextStyle(color: Colors.white)),
                  subtitle: const Text(
                    "Abre la carpeta de registros locales para depuración.",
                    style: TextStyle(color: Colors.white54, fontSize: 12),
                  ),
                  trailing: const Icon(Icons.open_in_new, size: 18, color: Colors.white30),
                  onTap: () => LogService().openLogs(),
                  tileColor: Colors.white.withValues(alpha: 0.05),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),

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
              fillColor: Colors.white.withValues(alpha: 0.05),
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
          color: AppTheme.background.withValues(alpha: 0.5),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.green.withValues(alpha: 0.3)),
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
        color: Colors.white.withValues(alpha: 0.05),
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
        String errorMessage = e.toString();
        if (errorMessage.contains("invalid_credentials")) {
          errorMessage = "Credenciales inválidas. Verifica tu correo y contraseña.";
        } else if (errorMessage.contains("Email not confirmed")) {
          errorMessage = "Correo no confirmado. Por favor, revisa tu bandeja de entrada.";
        }

        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            backgroundColor: AppTheme.background,
            title: const Text("Error de Vinculación", style: TextStyle(color: Colors.redAccent)),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(errorMessage, style: const TextStyle(color: Colors.white)),
                const SizedBox(height: 16),
                const Text(
                  "Si crees que esto es un error, intenta cerrar sesión e iniciarla nuevamente.",
                  style: TextStyle(color: Colors.white54, fontSize: 12),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text("ENTENDIDO"),
              ),
              ElevatedButton(
                onPressed: () async {
                   final nav = Navigator.of(context);
                   nav.pop();
                   await SessionService().logout();
                   if (mounted) {
                     nav.pushReplacementNamed('/login');
                   }
                },
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red.withValues(alpha: 0.2)),
                child: const Text("CERRAR SESIÓN", style: TextStyle(color: Colors.redAccent)),
              ),
            ],
          ),
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
              fillColor: Colors.white.withValues(alpha: 0.05),
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
              fillColor: Colors.white.withValues(alpha: 0.05),
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
              thumbColor: WidgetStateProperty.all(AppTheme.accent),
              onChanged: (val) => setState(() => _fullscreen = val),
            ),
          ],
        ),
      ],
    );
  }



  Widget _buildUpdateSection() {
    return ListenableBuilder(
      listenable: UpdateService(),
      builder: (context, _) {
        final isUpdateAvailable = UpdateService().isUpdateAvailable;
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.05),
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
                      builder: (context) => const UpdateDialogWidget(),
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
  Widget _buildTwoFactorSection() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          ListTile(
            leading: Icon(
              Icons.shield,
              color: _isLoading2FA
                  ? Colors.white24
                  : (_is2FAEnabled ? Colors.greenAccent : Colors.orangeAccent),
            ),
            title: const Text("Autenticación en dos pasos", style: TextStyle(color: Colors.white)),
            subtitle: Text(
              _isLoading2FA
                  ? "Cargando estado..."
                  : (_is2FAEnabled ? "Activado" : "Desactivado"),
              style: TextStyle(
                  color: _isLoading2FA
                      ? Colors.white30
                      : (_is2FAEnabled
                          ? Colors.greenAccent.withValues(alpha: 0.7)
                          : Colors.orangeAccent.withValues(alpha: 0.7)),
                  fontSize: 12),
            ),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (!_is2FAEnabled && !_isLoading2FA)
                  TextButton(
                    onPressed: _manualSync,
                    style: TextButton.styleFrom(
                      foregroundColor: AppTheme.accent,
                      backgroundColor: AppTheme.accent.withValues(alpha: 0.1),
                    ),
                    child: const Text("Vincular", style: TextStyle(fontSize: 12)),
                  ),
                IconButton(
                  icon: const Icon(Icons.refresh, color: Colors.white54, size: 20),
                  onPressed: _isLoading2FA ? null : _check2FAStatus,
                ),
              ],
            ),
          ),
          if (!_isLoading2FA)
            Padding(
              padding: const EdgeInsets.only(bottom: 12, left: 16, right: 16),
              child: InkWell(
                onTap: () async {
                  final Uri url = Uri.parse("https://crystaltidessmp.net/account");
                  if (await canLaunchUrl(url)) {
                    await launchUrl(url);
                  }
                },
                child: const Row(
                  children: const [
                    Text(
                      "Gestionar en Web",
                      style: TextStyle(
                        color: AppTheme.accent,
                        fontSize: 12,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                    SizedBox(width: 4),
                    Icon(Icons.open_in_new, size: 10, color: AppTheme.accent),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildProfileManagementSection() {
    final avatarUrl = SessionService().currentSession?.linkedCrystalAvatar ?? 
                      SessionService().currentSession?.skinUrl;
    
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(12),
      ),
      child: ListTile(
        leading: ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: avatarUrl != null 
            ? Image.network(
                avatarUrl,
                width: 40,
                height: 40,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => const Icon(Icons.person, color: Colors.white70),
              )
            : const Icon(Icons.person, color: Colors.white70),
        ),
        title: const Text("Foto de Perfil", style: TextStyle(color: Colors.white)),
        subtitle: const Text(
          "Personaliza tu perfil en la web y el launcher.",
          style: TextStyle(color: Colors.white54, fontSize: 12),
        ),
        trailing: _isUpdatingAvatar
          ? const SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : TextButton.icon(
              onPressed: _updateProfilePicture,
              icon: const Icon(Icons.edit, size: 16),
              label: const Text("CAMBIAR", style: TextStyle(fontSize: 12)),
              style: TextButton.styleFrom(
                foregroundColor: AppTheme.accent,
                backgroundColor: AppTheme.accent.withValues(alpha: 0.1),
              ),
            ),
      ),
    );

  }

  Widget _buildLauncherConfigSection() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          SwitchListTile(
            value: _minimizeToTray,
            onChanged: (val) => setState(() => _minimizeToTray = val),
            title: const Text("Minimizar a la Bandeja", style: TextStyle(color: Colors.white)),
            subtitle: const Text(
              "Al cerrar la ventana, el launcher seguirá ejecutándose en segundo plano.",
              style: TextStyle(color: Colors.white54, fontSize: 12),
            ),
            secondary: Icon(
              Icons.download_rounded, 
              color: _minimizeToTray ? AppTheme.accent : Colors.white24,
            ),

            activeTrackColor: AppTheme.accent.withValues(alpha: 0.5),
            inactiveTrackColor: Colors.white10,
          ),
        ],
      ),
    );
  }
}
