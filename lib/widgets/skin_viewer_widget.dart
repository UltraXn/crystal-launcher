import 'package:flutter/material.dart';
import 'package:webview_windows/webview_windows.dart';
import 'package:file_selector/file_selector.dart';
import 'dart:convert';
import '../services/session_service.dart';
import '../utils/logger.dart';
import '../theme/app_theme.dart';

class SkinViewerWidget extends StatefulWidget {
  const SkinViewerWidget({super.key});

  @override
  State<SkinViewerWidget> createState() => _SkinViewerWidgetState();
}

class _SkinViewerWidgetState extends State<SkinViewerWidget> {
  final _controller = WebviewController();
  bool _initialized = false;

  @override
  void initState() {
    super.initState();
    _initWebview();
  }

  Future<void> _initWebview() async {
    try {
      final bundle = DefaultAssetBundle.of(context);
      await _controller.initialize();
      if (!mounted) return;

      String htmlContent = await bundle.loadString('assets/web/skin_viewer/index.html');
      final jsContent = await bundle.loadString('assets/web/skin_viewer/skinview3d.bundle.js');
          
      htmlContent = htmlContent.replaceFirst(
        '<script src="skinview3d.bundle.js"></script>',
        '<script>$jsContent</script>'
      );
          
      await _controller.loadStringContent(htmlContent);
      await Future.delayed(const Duration(milliseconds: 500));

      if (mounted) {
        setState(() => _initialized = true);
        _updateSkin();
      }
    } catch (e) {
      logger.e("Error initializing SkinViewer WebView: $e");
      if (mounted) setState(() => _initialized = false);
    }
  }

  Future<void> _updateSkin() async {
    if (!_initialized || !mounted) return;
    final skinUrl = await SessionService().getSkinTextureUrl();
    logger.i("SkinViewer: Applying URL: ${skinUrl.startsWith('data') ? 'Base64 Data' : skinUrl}");
    if (!mounted) return;
    await _controller.executeScript('if(typeof setSkin === "function") { setSkin("$skinUrl"); }');
  }

  Future<void> _pickLocalSkin() async {
    const XTypeGroup typeGroup = XTypeGroup(
      label: 'Minecraft skins',
      extensions: <String>['png'],
    );
    final XFile? file = await openFile(acceptedTypeGroups: <XTypeGroup>[typeGroup]);

    if (file != null) {
      final bytes = await file.readAsBytes();
      final base64Skin = 'data:image/png;base64,${base64Encode(bytes)}';
      
      // Update the current session with the local skin (temporarily or permanently)
      // For now, let's just push it to the viewer directly to show it works
      await _controller.executeScript('setSkin("$base64Skin")');
      logger.i("SkinViewer: Local skin loaded from ${file.path}");
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: SessionService(),
      builder: (context, child) {
        _updateSkin();

        return ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Stack(
            children: [
              if (!_initialized)
                const Center(child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white24))
              else
                Webview(
                  _controller,
                  permissionRequested: (url, permissionKind, isUserInitiated) =>
                      WebviewPermissionDecision.deny,
                ),
              
              // Floating Action Button to change skin
              Positioned(
                bottom: 16,
                right: 16,
                child: MouseRegion(
                  cursor: SystemMouseCursors.click,
                  child: GestureDetector(
                    onTap: _pickLocalSkin,
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.black54,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.white10),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.upload_file, size: 16, color: AppTheme.accent),
                          SizedBox(width: 8),
                          Text(
                            "SUBIR SKIN",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}
