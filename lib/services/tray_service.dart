import 'dart:io';

import 'package:tray_manager/tray_manager.dart';
import 'package:window_manager/window_manager.dart';
import 'log_service.dart';

class TrayService with TrayListener {
  static final TrayService _instance = TrayService._internal();
  factory TrayService() => _instance;
  TrayService._internal();

  bool _isInitialized = false;

  Future<void> initialize() async {
    if (_isInitialized) return;
    
    try {
      await trayManager.setIcon(
        Platform.isWindows ? 'assets/images/app_icon.ico' : 'assets/images/app_icon.png',
      );
      
      // Setup context menu
      await trayManager.setContextMenu(Menu(items: [
        MenuItem(
          key: 'show_window',
          label: 'Abrir CrystalTides',
        ),
        MenuItem.separator(),
        MenuItem(
          key: 'exit_app',
          label: 'Salir',
        ),
      ]));

      trayManager.addListener(this);
      _isInitialized = true;
      logService.log("📥 Tray Service Initialized", category: "SYSTEM");
    } catch (e) {
      logService.log("⚠️ Failed to init tray: $e", level: Level.warning, category: "SYSTEM");
    }
  }

  void destroy() {
    trayManager.removeListener(this);
    trayManager.destroy(); // Cleanup if needed
  }

  @override
  void onTrayIconMouseDown() {
    // Left click usually restores window
    windowManager.show();
    windowManager.focus();
  }

  @override
  void onTrayIconRightMouseDown() {
    trayManager.popUpContextMenu();
  }

  @override
  void onTrayMenuItemClick(MenuItem menuItem) {
    switch (menuItem.key) {
      case 'show_window':
        windowManager.show();
        windowManager.focus();
        break;
      case 'exit_app':
        // Force close, bypassing the close prevention
        // We might need a flag to distinguish between user close (minimize) and tray exit (quit)
        windowManager.destroy(); 
        break;
    }
  }
}
