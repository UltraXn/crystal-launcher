import 'package:flutter/material.dart';
import 'package:window_manager/window_manager.dart';
import '../services/database_service.dart';
import '../services/log_service.dart';

class TrayListenerWrapper extends StatefulWidget {
  final Widget child;

  const TrayListenerWrapper({super.key, required this.child});

  @override
  State<TrayListenerWrapper> createState() => _TrayListenerWrapperState();
}

class _TrayListenerWrapperState extends State<TrayListenerWrapper> with WindowListener {
  @override
  void initState() {
    super.initState();
    windowManager.addListener(this);
    _initWindow();
  }

  Future<void> _initWindow() async {
    // Prevent default close to handle it manually
    await windowManager.setPreventClose(true);
  }

  @override
  void dispose() {
    windowManager.removeListener(this);
    super.dispose();
  }

  @override
  void onWindowClose() async {
    try {
      final settings = await DatabaseService().getSettings();
      // Default to true if null, though DB should have default
      final  shouldMinimize = settings.minimizeToTray; 

      if (shouldMinimize) {
        logService.log("📉 Minimizing to tray...", category: "WINDOW");
        await windowManager.hide();
      } else {
        logService.log("❌ Closing app...", category: "WINDOW");
        await windowManager.destroy();
      }
    } catch (e) {
      logService.log("⚠️ Error handling window close: $e", level: Level.warning);
      // Fallback
      await windowManager.destroy();
    }
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}
