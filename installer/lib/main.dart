import 'package:flutter/material.dart';
import 'package:window_manager/window_manager.dart';
import 'main_shell.dart';
import 'services/log_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await logService.initialize();
  logService.log("🚀 Starting CrystalTides Installer...");
  
  await windowManager.ensureInitialized();

  WindowOptions windowOptions = const WindowOptions(
    size: Size(700, 500),
    minimumSize: Size(700, 500),
    maximumSize: Size(700, 500),
    center: true,
    backgroundColor: Colors.transparent,
    skipTaskbar: false,
    titleBarStyle: TitleBarStyle.hidden,
    windowButtonVisibility: false,
  );

  windowManager.waitUntilReadyToShow(windowOptions, () async {
    await windowManager.setAsFrameless();
    await windowManager.setResizable(false);
    await windowManager.setHasShadow(false);
    await windowManager.setBackgroundColor(Colors.transparent);
    await windowManager.setIcon('assets/images/app_icon.png');
    await windowManager.show();
    await windowManager.focus();
  });

  runApp(const CrystalTidesSMPInstaller());
}
