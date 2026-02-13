import 'dart:io';
import 'package:flutter/material.dart';
import 'package:desktop_drop/desktop_drop.dart';
import '../services/session_service.dart';
import '../services/admin_service.dart';
import '../theme/app_theme.dart';
class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  bool _isAdminDragging = false;
  String _adminUploadStatus = "";
  bool _isLoading = false;

  bool get _isAdmin => SessionService().currentSession?.isAdmin ?? false;

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final session = SessionService().currentSession;
    final avatarUrl = session?.linkedCrystalAvatar ?? session?.skinUrl;
    final username = session?.username ?? "Usuario";
    final role = session?.effectiveRole ?? "Jugador";

    return Scaffold(
      backgroundColor: Colors.transparent,
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

                const SizedBox(height: 32),
                const Center(
                  child: Text(
                    "Información de perfil y estadísticas próximamente.",
                    style: TextStyle(color: Colors.white24, fontSize: 12),
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
