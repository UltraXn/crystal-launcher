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
import 'services/asset_service.dart';
import 'services/minecraft_engine.dart';
import 'services/auth_service.dart';
import 'ui/pages/login_page.dart';

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
    minimumSize: Size(960, 600), // Prevent layout breaking
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
        Provider<AuthService>(create: (_) => AuthService(database)),
        Provider<LaunchService>(create: (_) => LaunchService()),
        Provider<MinecraftService>(create: (_) => MinecraftService()),
        Provider<DownloadService>(create: (_) => DownloadService()),
        Provider<AssetService>(
            create: (ref) => AssetService(ref.read<DownloadService>())),
        ProxyProvider3<MinecraftService, DownloadService, AssetService,
            MinecraftEngine>(
          update: (_, mc, dl, assets, __) => MinecraftEngine(mc, dl, assets),
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
      home: const AuthWrapper(),
    );
  }
}

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  @override
  Widget build(BuildContext context) {
    // Watch the active account stream. If null, we are logged out.
    // If not null, we have a session.
    return StreamBuilder<Account?>(
      stream: context.read<AuthService>().watchActiveAccount(),
      builder: (context, snapshot) {
        // We can show a loading spinner while connection state is waiting,
        // but normally watch emits quickly.
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            backgroundColor: Color(0xFF0C1425),
            body: Center(child: CircularProgressIndicator()),
          );
        }

        final account = snapshot.data;
        if (account != null) {
          // pass chid if needed, or just normal shell
          return const CrystalShell(child: HomePage());
        } else {
          return const LoginPage();
        }
      },
    );
  }
}
