import 'package:flutter/material.dart';
import 'package:window_manager/window_manager.dart';
import 'main_shell.dart';

void main(List<String> args) async {
  WidgetsFlutterBinding.ensureInitialized();
  await windowManager.ensureInitialized();

  String? installDir;
  for (int i = 0; i < args.length; i++) {
    if (args[i] == '--install-dir' && i + 1 < args.length) {
      installDir = args[i + 1];
    }
  }

  WindowOptions windowOptions = const WindowOptions(
    size: Size(650, 480),
    center: true,
    backgroundColor: Colors.transparent,
    skipTaskbar: false,
    titleBarStyle: TitleBarStyle.hidden,
    windowButtonVisibility: false,
    title: "Crystal Uninstaller",
  );

  windowManager.waitUntilReadyToShow(windowOptions, () async {
    await windowManager.setAsFrameless();
    await windowManager.setResizable(false);
    await windowManager.setHasShadow(false);
    await windowManager.setBackgroundColor(Colors.transparent);
    await windowManager.show();
    await windowManager.focus();
  });

  runApp(CrystalTidesUninstaller(installDir: installDir));
}
