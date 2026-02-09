import 'dart:io';
import 'package:flutter/material.dart';
import 'package:desktop_drop/desktop_drop.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/session_service.dart';
import '../services/supabase_service.dart';
import '../services/admin_service.dart';
import '../services/two_factor_service.dart';
import '../theme/app_theme.dart';
import '../components/two_factor_prompt.dart';
class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  final TwoFactorService _twoFactorService = TwoFactorService();
  bool _isAdminDragging = false;
  String _adminUploadStatus = "";
  bool _isLoading = false;
  
  // 2FA State
  bool _is2FAEnabled = false;
  bool _isLoading2FA = true;

  bool get _isAdmin => SessionService().currentSession?.isAdmin ?? false;

  @override
  void initState() {
    super.initState();
    _check2FAStatus();
  }

  Future<void> _check2FAStatus() async {
    final token = SessionService().currentSession?.accessToken;
    if (token != null) {
      final enabled = await _twoFactorService.checkStatus(token);
      if (mounted) {
        setState(() {
          _is2FAEnabled = enabled;
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
      // CRITICAL: Disable Hero animations for this dialog to prevent crash
      // The Hero animation conflict occurs because AuthWrapper rebuilds during dialog transition
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
              // Store token temporarily - DO NOT elevate session yet
              // This prevents notifyListeners() during dialog transition
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

    // CRITICAL: Elevate session AFTER dialog has fully closed
    // This prevents Hero animation crash caused by rebuilds during route transition
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

  @override
  Widget build(BuildContext context) {
    final session = SessionService().currentSession;
    final avatarUrl = session?.linkedCrystalAvatar ?? session?.skinUrl;
    final username = session?.username ?? "Usuario";
    final role = session?.effectiveRole ?? "Jugador";

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text("Mi Perfil"),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(24),
              children: [
                // Header Perfil
                Center(
                  child: Column(
                    children: [
                      CircleAvatar(
                        radius: 50,
                        backgroundColor: Colors.white10,
                        backgroundImage: (avatarUrl != null && avatarUrl.isNotEmpty)
                            ? NetworkImage(avatarUrl)
                            : null,
                        child: (avatarUrl == null || avatarUrl.isEmpty)
                            ? const Icon(Icons.person, size: 50, color: Colors.white70)
                            : null,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        username,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        role.toUpperCase(),
                        style: TextStyle(
                          color: AppTheme.accent.withValues(alpha: 0.8),
                          fontSize: 14,
                          letterSpacing: 1.5,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 48),

                // Sección Admin (si aplica)
                if (_isAdmin) ...[
                  _buildSectionHeader("Panel de Administración", Icons.admin_panel_settings),
                  const SizedBox(height: 16),
                  _buildAdminSection(),
                  const SizedBox(height: 32),
                ],

                // Otras opciones de perfil
                _buildSectionHeader("Cuenta", Icons.person_outline),
                const SizedBox(height: 16),
                
                // 2FA Status
                ListTile(
                  leading: Icon(
                    Icons.shield, 
                    color: _isLoading2FA 
                        ? Colors.white24 
                        : (_is2FAEnabled ? Colors.greenAccent : Colors.orangeAccent)
                  ),
                  title: const Text("Autenticación en dos pasos (2FA)", style: TextStyle(color: Colors.white)),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _isLoading2FA 
                            ? "Cargando estado..." 
                            : (_is2FAEnabled ? "Activado" : "Desactivado"),
                        style: TextStyle(
                          color: _isLoading2FA 
                              ? Colors.white30 
                              : (_is2FAEnabled ? Colors.greenAccent.withValues(alpha: 0.7) : Colors.orangeAccent.withValues(alpha: 0.7)),
                          fontSize: 12
                        ),
                      ),
                      if (!_isLoading2FA)
                        Padding(
                          padding: const EdgeInsets.only(top: 4.0),
                          child: InkWell(
                            onTap: () async {
                              final Uri url = Uri.parse("https://crystaltidessmp.net/account");
                              if (await canLaunchUrl(url)) {
                                await launchUrl(url);
                              }
                            },
                            child: const Text(
                              "Gestionar en Web",
                              style: TextStyle(
                                color: AppTheme.accent,
                                fontSize: 12,
                                decoration: TextDecoration.underline,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),

                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (!_is2FAEnabled)
                        Padding(
                          padding: const EdgeInsets.only(right: 8.0),
                          child: TextButton(
                            onPressed: _manualSync,
                            style: TextButton.styleFrom(
                              foregroundColor: AppTheme.accent,
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              backgroundColor: AppTheme.accent.withValues(alpha: 0.1),
                            ),
                            child: const Text("Vincular Manualmente", style: TextStyle(fontSize: 12)),
                          ),
                        ),
                      IconButton(
                        icon: const Icon(Icons.refresh, color: Colors.white54),
                        onPressed: _isLoading2FA ? null : _check2FAStatus,
                        tooltip: "Recargar estado",
                      ),
                      if (_is2FAEnabled)
                        const Icon(Icons.check_circle, color: Colors.greenAccent, size: 16),
                    ],
                  ),
                  tileColor: Colors.white.withValues(alpha: 0.05),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                
                const SizedBox(height: 8),

                ListTile(
                  leading: const Icon(Icons.logout, color: Colors.redAccent),
                  title: const Text("Cerrar Sesión", style: TextStyle(color: Colors.white)),
                  onTap: () async {
                    await SessionService().logout();
                    if (!context.mounted) return;
                    Navigator.pushReplacementNamed(context, '/login');
                  },
                  tileColor: Colors.white.withValues(alpha: 0.05),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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

  Widget _buildAdminSection() {
    return DropTarget(
      onDragDone: (detail) async {
        if (detail.files.isEmpty) return;

        setState(() => _isLoading = true);
        try {
          for (final xFile in detail.files) {
            if (xFile.name.endsWith('.jar')) {
              await AdminService().processAdminModImport(
                File(xFile.path),
                onStatusUpdate: (status) {
                  if (mounted) setState(() => _adminUploadStatus = status);
                },
              );
            }
          }
        } catch (e) {
          if (!mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text("Error al importar mod: $e"), backgroundColor: Colors.red),
          );
        } finally {
          if (mounted) setState(() => _isLoading = false);
        }
      },
      onDragEntered: (detail) => setState(() => _isAdminDragging = true),
      onDragExited: (detail) => setState(() => _isAdminDragging = false),
      child: Stack(
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.red.withValues(alpha: 0.05),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: _isAdminDragging
                    ? Colors.redAccent
                    : Colors.red.withValues(alpha: 0.2),
                width: _isAdminDragging ? 2 : 1,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      "GESTIÓN DE REPOSITORIO OFICIAL",
                      style: TextStyle(
                        color: Colors.redAccent,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (_adminUploadStatus.isNotEmpty)
                      Text(
                        _adminUploadStatus,
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 10,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 12),
                const Text(
                  "Arrastra archivos .jar aquí para subirlos al servidor y sincronizarlos con todos los usuarios automáticamente.",
                  style: TextStyle(color: Colors.white70, fontSize: 13),
                ),
                const SizedBox(height: 16),
                const Text(
                  "ESTA ACCIÓN ES GLOBAL Y PERMANENTE",
                  style: TextStyle(
                    color: Colors.redAccent,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.1,
                  ),
                ),
              ],
            ),
          ),
          if (_isAdminDragging)
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.redAccent.withValues(alpha: 0.4),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.cloud_upload, color: Colors.white, size: 48),
                      SizedBox(height: 8),
                      Text(
                        "SOLTAR PARA SINCRONIZAR",
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
