import 'dart:io';
import 'package:flutter/material.dart';
import 'package:webview_windows/webview_windows.dart';
import 'package:path/path.dart' as p;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class SkinViewerWidget extends StatefulWidget {
  final String? skinUrl;

  const SkinViewerWidget({super.key, this.skinUrl});

  @override
  State<SkinViewerWidget> createState() => _SkinViewerWidgetState();
}

class _SkinViewerWidgetState extends State<SkinViewerWidget> {
  final _controller = WebviewController();
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    _initWebview();
  }

  Future<void> _initWebview() async {
    try {
      await _controller.initialize();

      // Resolve path to assets/web/skin_viewer/index.html
      // In debug/dev mode, we might need to point to the source folder
      // In production, it should be relative to the executable

      String htmlPath;
      if (Platform.isWindows) {
        // Development Path Fix (Assuming running from source)
        // Adjust this relative logic based on where 'flutter run' is executed
        final String currentDir = Directory.current.path;
        htmlPath = p.join(
          currentDir,
          'assets',
          'web',
          'skin_viewer',
          'index.html',
        );

        // If file doesn't exist, try local package asset logic (production)
        // For now, absolute path source fix is easiest for dev
      } else {
        return;
      }

      await _controller.loadUrl(Uri.file(htmlPath).toString());

      // Once loaded, set the initial skin if provided
      if (widget.skinUrl != null) {
        // Wait a bit for JS to be ready
        Future.delayed(const Duration(seconds: 1), () {
          _controller.executeScript("setSkin('${widget.skinUrl}')");
        });
      }

      if (mounted) {
        setState(() {
          _isInitialized = true;
        });
      }
    } catch (e) {
      debugPrint("Error initializing SkinViewer: $e");
    }
  }

  @override
  void didUpdateWidget(SkinViewerWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.skinUrl != oldWidget.skinUrl && _isInitialized) {
      _controller.executeScript("setSkin('${widget.skinUrl}')");
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_isInitialized) {
      return const Center(child: CircularProgressIndicator());
    }
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: Webview(_controller),
    );
  }
}
