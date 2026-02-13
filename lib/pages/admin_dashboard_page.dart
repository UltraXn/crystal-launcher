import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import '../services/admin_service.dart';
import '../services/two_factor_service.dart';
import '../services/session_service.dart';
import '../components/two_factor_prompt.dart';
import '../theme/app_theme.dart';

class AdminDashboardPage extends StatefulWidget {
  const AdminDashboardPage({super.key});

  @override
  State<AdminDashboardPage> createState() => _AdminDashboardPageState();
}

class _AdminDashboardPageState extends State<AdminDashboardPage> {
  final AdminService _adminService = AdminService();
  final TwoFactorService _twoFactorService = TwoFactorService();
  final SessionService _sessionService = SessionService();

  String? _selectedPath;
  List<Map<String, dynamic>> _localMods = [];
  bool _isScanning = false;
  bool _isSyncing = false;
  double _syncProgress = 0.0;
  String _statusMessage = "Listo para escanear";

  // 2FA State
  bool _isLoadingAuth = true;
  bool _isVerified = false;

  @override
  void initState() {
    super.initState();
    _checkSecurity();
  }

  Future<void> _checkSecurity() async {
    final session = _sessionService.currentSession;
    
    if (session == null) {
      // Should not happen as route is protected, but safe fallback
      if (mounted) Navigator.of(context).pop();
      return;
    }

    // CRITICAL FIX: Check if user already has adminToken from ProfilePage 2FA verification
    // If they do, skip the 2FA prompt and grant access immediately
    // AdminToken is sufficient - we don't need accessToken for admin operations
    if (session.adminToken != null && session.adminToken!.isNotEmpty) {
      if (mounted) {
        setState(() {
          _isVerified = true;
          _isLoadingAuth = false;
        });
      }
      return;
    }

    // No adminToken - check if we need to prompt for 2FA
    if (session.accessToken == null) {
      if (mounted) Navigator.of(context).pop();
      return;
    }

    // Check if 2FA is enabled for this user
    bool isEnabled = await _twoFactorService.checkStatus(session.accessToken!);

    if (!isEnabled) {
      // If 2FA is not enabled, we treat it as verified (or warn them)
      // For higher security, we might force them to enable it, but for now allow access.
      if (mounted) {
        setState(() {
          _isVerified = true;
          _isLoadingAuth = false;
        });
      }
    } else {
      // 2FA Enabled -> Show Prompt
      if (mounted) {
        setState(() => _isLoadingAuth = false);
        _show2FAPrompt();
      }
    }
  }

  void _show2FAPrompt() {
    showDialog(
      context: context,
      barrierDismissible: false,
      barrierColor: Colors.black.withValues(alpha: 0.9),
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: TwoFactorPrompt(
          onVerify: (code) async {
            final token = _sessionService.currentSession?.accessToken;
            if (token == null) return false;
            
            final adminToken = await _twoFactorService.verify(token, code);
            if (adminToken != null) {
              // Verification Success
              if (mounted) {
                setState(() => _isVerified = true);
                if (!context.mounted) return false;
                Navigator.of(context).pop(); // Close dialog
              }
              return true;
            }
            return false;
          },
          onCancel: () {
            Navigator.of(context).pop(); // Close dialog
            Navigator.of(context).pop(); // Go back from Admin Page
          },
        ),
      ),
    );
  }

  Future<void> _pickDirectory() async {
    String? result = await FilePicker.platform.getDirectoryPath();
    if (result != null) {
      setState(() {
        _selectedPath = result;
        _localMods = [];
        _statusMessage = "Carpeta seleccionada. Haz clic en Escanear.";
      });
    }
  }

  Future<void> _scanMods() async {
    if (_selectedPath == null) return;
    setState(() {
      _isScanning = true;
      _statusMessage = "Escaneando archivos...";
    });

    try {
      final mods = await _adminService.scanLocalMods(_selectedPath!);
      setState(() {
        _localMods = mods;
        _isScanning = false;
        _statusMessage = "Se encontraron ${mods.length} mods.";
      });
    } catch (e) {
      setState(() {
        _isScanning = false;
        _statusMessage = "Error al escanear: $e";
      });
    }
  }

  Future<void> _syncAll() async {
    if (_localMods.isEmpty) return;
    setState(() {
      _isSyncing = true;
      _syncProgress = 0.0;
      _statusMessage = "Iniciando sincronización...";
    });

    try {
      await _adminService.uploadModsBatch(
        _localMods,
        onProgress: (current, total, message) {
          setState(() {
            _statusMessage = message;
            _syncProgress = current / total;
          });
        },
      );

      setState(() => _statusMessage = "Publicando en base de datos...");
      await _adminService.publishMods(_localMods);

      setState(() {
        _isSyncing = false;
        _syncProgress = 1.0;
        _statusMessage = "✨ Sincronización completada con éxito!";
      });
    } catch (e) {
      setState(() {
        _isSyncing = false;
        _statusMessage = "❌ Error en sincronización: $e";
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoadingAuth) {
      return const Scaffold(
        backgroundColor: AppTheme.background,
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (!_isVerified) {
      // Should be covered by the dialog barrier, but as a fallback
      return const Scaffold(
        backgroundColor: AppTheme.background,
        body: Center(child: Text("Waiting for verification...", style: TextStyle(color: Colors.white))),
      );
    }

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Stack(
        children: [
          // Background Gradient
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    AppTheme.background,
                    AppTheme.background.withValues(alpha: 0.8),
                    AppTheme.accent.withValues(alpha: 0.1),
                  ],
                ),
              ),
            ),
          ),

          // Main Content
          Padding(
            padding: const EdgeInsets.fromLTRB(32, 64, 32, 32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "PANEL DE ADMINISTRADOR",
                          style: TextStyle(
                            color: AppTheme.accent,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 2,
                          ),
                        ),
                        SizedBox(height: 8),
                        Text(
                          "Gestión de Modpack",
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 32,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    // Close button removed as navigation is now sidebar-based
                  ],
                ),
                const SizedBox(height: 32),

                // Config Card
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white10),
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  "Carpeta Local de Mods",
                                  style: TextStyle(color: Colors.white70, fontSize: 14),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  _selectedPath ?? "No seleccionada",
                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          ElevatedButton.icon(
                            onPressed: _isSyncing ? null : _pickDirectory,
                            icon: const Icon(Icons.folder_open),
                            label: const Text("Seleccionar"),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white12,
                              foregroundColor: Colors.white,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: (_selectedPath == null || _isSyncing) ? null : _scanMods,
                              icon: _isScanning 
                                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) 
                                : const Icon(Icons.search),
                              label: const Text("Escanear Carpeta"),
                              style: ElevatedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                backgroundColor: AppTheme.accent.withValues(alpha: 0.2),
                                foregroundColor: AppTheme.accent,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Status & Progress
                if (_isSyncing || _isScanning || _localMods.isNotEmpty)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.black26,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_statusMessage, style: const TextStyle(color: Colors.white70)),
                      if (_isSyncing) ...[
                        const SizedBox(height: 12),
                        LinearProgressIndicator(
                          value: _syncProgress,
                          backgroundColor: Colors.white10,
                          valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.accent),
                        ),
                      ],
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Mods List
                Expanded(
                  child: _localMods.isEmpty
                    ? Center(child: Text("No hay mods cargados", style: TextStyle(color: Colors.white.withValues(alpha: 0.3))))
                    : ListView.builder(
                        itemCount: _localMods.length,
                        itemBuilder: (context, index) {
                          final mod = _localMods[index];
                          return Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.02),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.extension, color: Colors.white38, size: 20),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    mod['name'],
                                    style: const TextStyle(color: Colors.white, fontSize: 14),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                Text(
                                  "${(mod['size'] / 1024 / 1024).toStringAsFixed(2)} MB",
                                  style: const TextStyle(color: Colors.white30, fontSize: 12),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                ),

                const SizedBox(height: 24),

                // Action Footer
                if (_localMods.isNotEmpty)
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isSyncing ? null : _syncAll,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 20),
                      backgroundColor: AppTheme.accent,
                      foregroundColor: Colors.black,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text(
                      _isSyncing ? "SINCRONIZANDO..." : "Subir y Publicar Modpack",
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Window Controls removed as they are now global in MainLayout
        ],
      ),
    );
  }
}
