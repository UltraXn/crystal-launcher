import 'package:flutter/material.dart';
import 'package:webview_windows/webview_windows.dart';
import '../../services/microsoft_auth_constants.dart';

class MicrosoftLoginWebView extends StatefulWidget {
  const MicrosoftLoginWebView({super.key});

  @override
  State<MicrosoftLoginWebView> createState() => _MicrosoftLoginWebViewState();
}

class _MicrosoftLoginWebViewState extends State<MicrosoftLoginWebView> {
  final _controller = WebviewController();
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    _initWebView();
  }

  Future<void> _initWebView() async {
    try {
      await _controller.initialize();
      await _controller.setBackgroundColor(Colors.transparent);
      await _controller.setPopupWindowPolicy(WebviewPopupWindowPolicy.deny);

      _controller.url.listen((url) {
        debugPrint("🌐 WebView Navigated to: $url");
        if (url.startsWith(MicrosoftAuthConstants.redirectUri)) {
          // Check for code
          final uri = Uri.parse(url);
          final code = uri.queryParameters['code'];
          if (code != null) {
            if (mounted) Navigator.of(context).pop(code); // Return the code
          } else if (uri.queryParameters['error'] != null) {
            if (mounted) {
              Navigator.of(context).pop(null); // Return null on error
            }
          }
        }
      });

      await _controller.loadUrl(MicrosoftAuthConstants.authorizeUrl);
      debugPrint(
          "🔍 WebView Loaded URL: ${MicrosoftAuthConstants.authorizeUrl}");

      if (mounted) {
        setState(() => _isInitialized = true);
      }
    } catch (e) {
      debugPrint("❌ WebView Init Error details: $e");
      if (mounted) Navigator.of(context).pop();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black, // Full screen background
      appBar: AppBar(
        title: const Text("Microsoft Login"),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.of(context).pop(), // User cancelled
        ),
      ),
      body: Stack(
        children: [
          if (_isInitialized) Webview(_controller),
          if (!_isInitialized) const Center(child: CircularProgressIndicator()),
        ],
      ),
    );
  }
}
