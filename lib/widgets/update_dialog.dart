import 'package:flutter/material.dart';
import '../services/update_service.dart';
import '../theme/app_theme.dart';

class UpdateDialogWidget extends StatefulWidget {
  const UpdateDialogWidget({super.key});

  @override
  State<UpdateDialogWidget> createState() => _UpdateDialogWidgetState();
}

class _UpdateDialogWidgetState extends State<UpdateDialogWidget> {
  double _progress = 0;
  bool _isDownloading = false;
  String? _error;

  Future<void> _startUpdate() async {
    setState(() {
      _isDownloading = true;
      _error = null;
    });

    try {
      await UpdateService().downloadUpdate((p) {
        setState(() => _progress = p);
      });
      await UpdateService().applyUpdate();
    } catch (e) {
      if (mounted) {
        setState(() {
          _isDownloading = false;
          _error = "Error al descargar la actualización: $e";
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: const Color(0xFF1A1A1A),
      title: const Text(
        "Actualización Disponible",
        style: TextStyle(color: Colors.white),
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            "Una nueva versión (${UpdateService().latestVersion}) está lista para descargar.",
            style: const TextStyle(color: Colors.white70),
          ),
          if (_isDownloading) ...[
            const SizedBox(height: 24),
            LinearProgressIndicator(
              value: _progress,
              backgroundColor: Colors.white10,
              color: AppTheme.accent,
            ),
            const SizedBox(height: 8),
            Text(
              "${(_progress * 100).toStringAsFixed(0)}%",
              style: const TextStyle(color: Colors.white54, fontSize: 12),
            ),
          ],
          if (_error != null) ...[
            const SizedBox(height: 16),
            Text(
              _error!,
              style: const TextStyle(color: Colors.redAccent, fontSize: 12),
            ),
          ],
        ],
      ),
      actions: [
        if (!_isDownloading)
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text(
              "Más tarde",
              style: TextStyle(color: Colors.white38),
            ),
          ),
        ElevatedButton(
          onPressed: _isDownloading ? null : _startUpdate,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.accent,
            foregroundColor: Colors.black,
          ),
          child: Text(_isDownloading ? "Descargando..." : "Actualizar Ahora"),
        ),
      ],
    );
  }
}
