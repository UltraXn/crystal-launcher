import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:path/path.dart' as p;
import 'database_service.dart';

class ProcessRunner {
  static final ProcessRunner _instance = ProcessRunner._internal();

  factory ProcessRunner() => _instance;

  ProcessRunner._internal();

  Future<void> launchGame({
    required String username,
    required String uuid,
    required String accessToken,
    required String gameDirectory,
    String version = '1.20.1',
  }) async {
    // 1. Get Settings
    final settings = await DatabaseService().getSettings();
    final javaPath = settings.javaPath;
    final maxRam = settings.maxRam;
    final width = settings.width;
    final height = settings.height;
    final fullscreen = settings.fullscreen;

    if (javaPath == null || javaPath.isEmpty) {
      throw Exception("Java Path is not configured");
    }

    // 2. Build Arguments
    List<String> args = [];

    // JVM Flags
    args.add('-Xmx${maxRam}M');
    args.add('-XX:+UnlockExperimentalVMOptions');
    args.add('-XX:+UseG1GC');
    args.add('-XX:G1NewSizePercent=20');
    args.add('-XX:G1ReservePercent=20');
    args.add('-XX:MaxGCPauseMillis=50');
    args.add('-XX:G1HeapRegionSize=32M');

    // Natives & Libraries (Placeholder logic - needs AssetDownloader)
    final nativesPath = p.join(gameDirectory, 'versions', version, 'natives');
    final librariesPath = _buildClasspath(
      gameDirectory,
      version,
    ); // TODO: Implement real classpath scanner

    args.add('-Djava.library.path=$nativesPath');
    args.add('-cp');
    args.add(librariesPath);

    // Main Class
    args.add('net.minecraft.client.main.Main');

    // Game Arguments
    args.add('--username');
    args.add(username);
    args.add('--version');
    args.add(version);
    args.add('--gameDir');
    args.add(gameDirectory);
    args.add('--assetsDir');
    args.add(p.join(gameDirectory, 'assets'));
    args.add('--assetIndex');
    args.add(version); // Assuming 1.20.1 index name matches
    args.add('--uuid');
    args.add(uuid);
    args.add('--accessToken');
    args.add(accessToken);
    args.add('--userType');
    args.add('msa'); // or 'mojang'
    args.add('--versionType');
    args.add('release');

    if (fullscreen) {
      args.add('--fullscreen');
    } else {
      args.add('--width');
      args.add(width.toString());
      args.add('--height');
      args.add(height.toString());
    }

    debugPrint("Launching Minecraft with: $javaPath ${args.join(' ')}");

    // 3. Start Process
    final process = await Process.start(
      javaPath,
      args,
      workingDirectory: gameDirectory,
      mode: ProcessStartMode
          .detached, // Detached so launcher can close or stay independent
    );

    debugPrint("Process started with PID: ${process.pid}");

    // Optional: Monitor stdout/stderr if not completely detached or for debugging
    // process.stdout.transform(utf8.decoder).listen((data) => debugPrint("MC: $data"));
    // process.stderr.transform(utf8.decoder).listen((data) => debugPrint("MC ERR: $data"));
  }

  // Very basic placeholder. In reality, we need to read the version.json to get the list of libraries.
  String _buildClasspath(String gameDir, String version) {
    // This is where we would scan the libraries folder and the version jar
    final versionJar = p.join(gameDir, 'versions', version, '$version.jar');

    // NOTE: This is incomplete. A real implementation parses version.json to find all libraries.
    // We will need a LibraryManager service for that.
    return versionJar;
  }
}
