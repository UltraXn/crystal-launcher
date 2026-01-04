import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:window_manager/window_manager.dart';
import 'ui/shell.dart';
import 'ui/theme.dart';
import 'ui/pages/home_page.dart';
import 'data/database.dart';
import 'native_bridge.dart';
import 'services/launch_service.dart';
import 'services/minecraft_service.dart';
import 'services/download_service.dart';
import 'services/minecraft_engine.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await windowManager.ensureInitialized();

  // Initialize Database
  final database = AppDatabase();

  // Initialize Native Bridge
  final bridge = NativeBridge();

  WindowOptions windowOptions = const WindowOptions(
    size: Size(1100, 700),
    center: true,
    backgroundColor: Colors.transparent,
    skipTaskbar: false,
    titleBarStyle: TitleBarStyle.hidden,
  );

  windowManager.waitUntilReadyToShow(windowOptions, () async {
    await windowManager.show();
    await windowManager.focus();
  });

  runApp(
    MultiProvider(
      providers: [
        Provider<AppDatabase>.value(value: database),
        Provider<NativeBridge>.value(value: bridge),
        Provider<LaunchService>(create: (_) => LaunchService()),
        Provider<MinecraftService>(create: (_) => MinecraftService()),
        Provider<DownloadService>(create: (_) => DownloadService()),
        ProxyProvider2<MinecraftService, DownloadService, MinecraftEngine>(
          update: (_, mc, dl, __) => MinecraftEngine(mc, dl),
        ),
      ],
      child: const CrystalApp(),
    ),
  );
}

class CrystalApp extends StatelessWidget {
  const CrystalApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'CrystalLauncher',
      theme: CrystalTheme.darkTheme(context),
      home: const CrystalShell(
        child: HomePage(),
      ),
    );
  }
}
