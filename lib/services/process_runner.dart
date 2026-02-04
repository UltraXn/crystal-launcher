import 'dart:io';
import '../utils/logger.dart';
import 'package:path/path.dart' as p;
import 'database_service.dart';
import '../data/local_database.dart';
import 'game_installer_service.dart';

class ProcessRunner {
  static final ProcessRunner _instance = ProcessRunner._internal();

  factory ProcessRunner() => _instance;

  ProcessRunner._internal();

  Future<void> launchGame({
    required String username,
    required String uuid,
    required String accessToken,
    required String gameDirectory,
    String? version, // MC Version E.g. 1.20.1
    String? neoForgeVersion, // E.g. 20.4.80
    String? server,
    String? port,
  }) async {
    // 1. Get Settings & Profile
    final settings = await DatabaseService().getSettings();
    final profileId = settings.selectedProfileId;
    Profile? profile;

    if (profileId != null) {
      profile = await DatabaseService().getProfile(profileId);
    }

    // Determine configuration (Profile > explicit arg > Settings Default)
    // Version
    final effectiveVersion =
        version ?? profile?.mcVersion ?? settings.mcVersion ?? '1.20.1';
    final effectiveNeoForge =
        neoForgeVersion ??
        profile?.neoForgeVersion ??
        settings.neoForgeVersion ??
        '';

    // RAM
    final minRam = profile?.minRam ?? settings.minRam;
    final maxRam = profile?.maxRam ?? settings.maxRam;

    // Paths
    final javaPath = profile?.javaPath ?? settings.javaPath;
    final effectiveGameDir = profile?.gameDir ?? gameDirectory;

    // Java Args
    final customJavaArgs = profile?.javaArgs;

    // Window Settings
    final width = settings.width;
    final height = settings.height;
    final fullscreen = settings.fullscreen;

    if (javaPath == null || javaPath.isEmpty) {
      throw Exception("Java Path is not configured");
    }

    // Determine Version ID (Directory name in versions/)
    // If NeoForge is present, the installer usually creates a folder like "1.20.1-neoforge-20.4.80"
    // For now, we construct it based on standard conventions or fallback to vanilla
    String versionId = effectiveVersion;
    if (effectiveNeoForge.isNotEmpty) {
      // Standard NeoForge naming format
      // e.g. 1.20.1-neoforge-20.4.80
      // Try multiple potential directory names if unsure
      final potentialNeoId = "$effectiveVersion-neoforge-$effectiveNeoForge";
      if (await Directory(
        p.join(effectiveGameDir, 'versions', potentialNeoId),
      ).exists()) {
        versionId = potentialNeoId;
      } else {
        // Fallback/Warning: Might not be installed yet?
        logger.w(
          "NeoForge directory $potentialNeoId not found. Launching Vanilla?",
        );
      }
    }

    // 2. Get Launch Info (Classpath, MainClass, Args)
    final launchInfo = await GameInstallerService().getLaunchInfo(
      versionId,
      effectiveGameDir,
    );

    // 3. Build Arguments
    List<String> args = [];

    // JVM Flags
    args.add('-Xmx${maxRam}M');
    args.add('-Xms${minRam}M');
    // Generic flags
    args.add('-XX:+UnlockExperimentalVMOptions');
    args.add('-XX:+UseG1GC');
    args.add('-XX:G1NewSizePercent=20');
    args.add('-XX:G1ReservePercent=20');
    args.add('-XX:MaxGCPauseMillis=50');
    args.add('-XX:G1HeapRegionSize=32M');

    // Custom Profile Args
    if (customJavaArgs != null && customJavaArgs.isNotEmpty) {
      args.addAll(customJavaArgs.split(' '));
    }

    // JVM Args from JSON (e.g. natives path, etc.)
    // We need to parse valid arguments (some have rules).
    // For simplicity, launchInfo.jvmArgs currently contains raw strings.
    // Usually natives path is constructed manually or via -Djava.library.path

    final nativesPath = p.join(
      effectiveGameDir,
      'versions',
      versionId,
      'natives',
    );
    args.add('-Djava.library.path=$nativesPath');

    args.addAll(launchInfo.jvmArgs);

    // Classpath
    args.add('-cp');
    args.add(launchInfo.classpath.join(Platform.pathSeparator));

    // Main Class
    args.add(launchInfo.mainClass);

    // Game Arguments
    // We need to replace placeholders like ${auth_player_name}
    for (var arg in launchInfo.gameArgs) {
      arg = arg.replaceAll('\${auth_player_name}', username);
      arg = arg.replaceAll('\${version_name}', versionId);
      arg = arg.replaceAll('\${game_directory}', effectiveGameDir);
      arg = arg.replaceAll(
        '\${assets_root}',
        p.join(effectiveGameDir, 'assets'),
      );
      arg = arg.replaceAll(
        '\${assets_index_name}',
        effectiveVersion,
      ); // Usually just version like 1.20.1
      arg = arg.replaceAll('\${auth_uuid}', uuid);
      arg = arg.replaceAll('\${auth_access_token}', accessToken);
      arg = arg.replaceAll('\${user_type}', 'msa');
      arg = arg.replaceAll('\${version_type}', 'release');
      args.add(arg);
    }

    // Window Resolution overrides
    if (fullscreen) {
      args.add('--fullscreen');
    } else {
      args.add('--width');
      args.add(width.toString());
      args.add('--height');
      args.add(height.toString());
    }

    if (server != null) {
      args.add('--server');
      args.add(server);
      if (port != null) {
        args.add('--port');
        args.add(port);
      }
    }

    logger.i("Launching Minecraft ($versionId) with: $javaPath");
    // Securely log args (hide access token)
    final safeArgs = args
        .map((a) => a == accessToken ? 'ACCESS_TOKEN_HIDDEN' : a)
        .join(' ');
    logger.d("Args: $safeArgs");

    // 4. Start Process
    final process = await Process.start(
      javaPath,
      args,
      workingDirectory: effectiveGameDir,
      mode: ProcessStartMode.detached,
    );

    logger.i("Process started with PID: ${process.pid}");
  }

  // Helper moved to GameInstallerService
  // String _buildClasspath(...)
}
