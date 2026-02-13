import 'dart:io';
import 'log_service.dart';
import 'package:path/path.dart' as p;
import 'database_service.dart';
import '../data/local_database.dart';
import 'game_installer_service.dart';
import 'java_service.dart';

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

    // Auto-Provision Java if missing
    String finalJavaPath = javaPath ?? "";
    if (finalJavaPath.isEmpty) {
      logService.log("Java Path not configured in profile/settings. Invoking Java Runtime Manager...", category: "SYSTEM");
      try {
        final requiredJavaVersion = JavaService().getJavaVersionForMinecraft(effectiveVersion);
        logService.log("Detected required Java version: $requiredJavaVersion for Minecraft $effectiveVersion", category: "SYSTEM");
        
        finalJavaPath = await JavaService().ensureJava(requiredJavaVersion, onProgress: (p) {
          // We could broadcast this, but for now just logging sparingly
          // logService.log("Java Download: ${(p*100).toInt()}%", category: "SYSTEM");
        });
      } catch (e) {
        throw Exception("Failed to auto-provision Java Runtime: $e");
      }
    }

    // Determine Version ID (Directory name in versions/)
    // If NeoForge is present, the installer usually creates a folder like "1.20.1-neoforge-20.4.80"
    // For now, we construct it based on standard conventions or fallback to vanilla
    String versionId = effectiveVersion;
    if (effectiveNeoForge.isNotEmpty) {
      // Standard NeoForge naming format
      // Updated: Rust Installer creates "neoforge-21.1.219", NOT "1.21.1-neoforge..."
      final potentialNeoId = "neoforge-$effectiveNeoForge";
      final legacyNeoId = "$effectiveVersion-neoforge-$effectiveNeoForge";

      final versionsDir = Directory(p.join(effectiveGameDir, 'versions'));

      if (await Directory(p.join(versionsDir.path, potentialNeoId)).exists()) {
        versionId = potentialNeoId;
      } else if (await Directory(p.join(versionsDir.path, legacyNeoId))
          .exists()) {
        versionId = legacyNeoId;
      } else {
        // Fallback: Scan for any folder containing "neoforge"
        try {
          if (await versionsDir.exists()) {
            final list = await versionsDir.list().toList();
            final found = list.firstWhere(
              (e) => e is Directory && e.path.contains("neoforge"),
              orElse: () => Directory("NOT_FOUND"),
            );
            if (found.path != "NOT_FOUND") {
              versionId = p.basename(found.path);
              logService.log("Auto-detected NeoForge folder: $versionId", category: "SYSTEM");
            } else {
              logService.log("NeoForge directory not found. Launching Vanilla?", level: Level.warning, category: "SYSTEM");
            }
          }
        } catch (e) {
          logService.log("Error scanning versions directory", error: e, level: Level.error, category: "SYSTEM");
        }
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

    // Process JVM Args (Replace placeholders)
    for (var arg in launchInfo.jvmArgs) {
      arg = arg.replaceAll('\${version_name}', versionId);
      arg = arg.replaceAll(
          '\${library_directory}', p.join(effectiveGameDir, 'libraries'));
      // Force semicolon for Windows classpath separator to avoid any Platform.pathSeparator ambiguity
      arg = arg.replaceAll('\${classpath_separator}', ';');
      arg = arg.replaceAll('\${game_directory}', effectiveGameDir);

      // Targeted fix: Normalize slashes ONLY for the large classpath/module-path argument
      // to avoid breaking --add-exports (which need forward slashes) or other flags.
      // We identify it because it contains the library directory replacement or multiple semicolons.
      if (arg.contains(p.join(effectiveGameDir, 'libraries')) &&
          arg.contains(';')) {
        arg = arg.replaceAll('/', p.separator);
      }

      args.add(arg);
      if (arg.contains('bootstraplauncher')) {
        logService.log("[JVM-ARG-DEBUG] Bootstraplauncher arg: $arg", category: "GAME");
      }
    }

    // Classpath
    args.add('-cp');
    // Force semicolon separator for Windows and normalize slashes just in case
    // Also deduplicate entries to avoid UnionFileSystem confusion
    // AND filter out specific jars that might cause module conflicts if double-included
    var finalClasspath = launchInfo.classpath.toSet().where((path) {
      // NeoForge 1.21+ behaves weirdly if the client jar is in the classpath AND
      // loaded via ModuleLayer. It seems Bootstraplauncher handles the client jar itself
      // via --fml.mcVersion arguments, so adding it to -cp might cause "Modules minecraft and ... export package ..."
      // error.

      // We need to filter out the "Vanilla" jar (e.g. 1.21.1.jar) because NeoForge loads it differently.
      // The previous check might have missed it if versionId was neoforge-....
      // We check for "client.jar" or a jar that looks like a version jar (but not a library).
      // A simple heuristic: if it ends with .jar and is NOT in the libraries folder.

      bool isLibrary = path.contains(p.join(effectiveGameDir, 'libraries'));
      bool isVersionJar = !isLibrary && path.endsWith('.jar');

      if (isVersionJar) {
        // Check if this is the "minecraft" jar.
        logService.log("[CP-FILTER] Excluding potential duplicate client jar: $path", category: "GAME");
        return false;
      }
      return true;
    }).toList();

    if (finalClasspath.isEmpty) {
      // Safety net: If we filtered everything (unlikely), put it back or things will definitely break.
      // But for NeoForge, the libraries are usually enough to start Bootstrap.
      logService.log("Classpath is empty after filtering! Restoring original.", level: Level.warning, category: "GAME");
      finalClasspath = launchInfo.classpath;
    }

    var cp = finalClasspath.join(';');
    if (Platform.isWindows) {
      cp = cp.replaceAll('/', '\\');
    }
    args.add(cp);

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
      
      // Fix missing placeholders
      arg = arg.replaceAll('\${clientid}', uuid); // Use UUID as Client ID
      arg = arg.replaceAll(
          '\${auth_xuid}', uuid); // Use UUID as fallback for XUID
      
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

    logService.log("Launching Minecraft ($versionId) with: $finalJavaPath", category: "GAME");
    // Securely log args (hide access token)
    final safeArgs = args
        .map((a) => a == accessToken ? 'ACCESS_TOKEN_HIDDEN' : a)
        .join(' ');
    logService.log("Args: $safeArgs", level: Level.debug, category: "GAME");

    // 4. Start Process
    // 4. Start Process
    // DEBUG MODE: Use normal mode to capture output
    final process = await Process.start(
      finalJavaPath,
      args,
      workingDirectory: effectiveGameDir,
      mode: ProcessStartMode.normal, // Was detached
    );

    // Pipe output to logger
    process.stdout.transform(const SystemEncoding().decoder).listen((data) {
      logService.log("[MC-STDOUT] $data", category: "GAME");
    });
    process.stderr.transform(const SystemEncoding().decoder).listen((data) {
      logService.log("[MC-STDERR] $data", level: Level.error, category: "GAME");
    });
    logService.log("Process started with PID: ${process.pid}", category: "GAME");
  }

  // Helper moved to GameInstallerService
  // String _buildClasspath(...)
}
