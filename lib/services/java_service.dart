import 'dart:async';
import 'dart:io';
import 'package:path/path.dart' as p;
import 'log_service.dart';
import 'native_api.dart';

class JavaService {
  static final JavaService _instance = JavaService._internal();

  factory JavaService() => _instance;

  JavaService._internal();

  /// Ensures that a valid Java runtime for the given major version is installed.
  /// Returns the absolute path to the java executable (javaw.exe or java).
  ///
  /// [majorVersion] - The required Java major version (e.g., 8, 17, 21).
  /// [onProgress] - Optional callback for download/install progress (0.0 to 1.0).
  Future<String> ensureJava(int majorVersion, {void Function(double)? onProgress}) async {
    final installBaseDir = await _getJavaInstallBaseDir();
    final versionStr = majorVersion.toString();
    
    // 1. Check if already installed
    // We expect the native check to return the path if valid, or null/error if not.
    // The native check needs the specific directory to check? 
    // My native implementation `check_java_status` takes `installDir`.
    // It walks the dir to find the binary.
    // So we need to compute the expected install dir for this version.
    
    // Rust side implementation of `download_and_install_java` uses `install_dir.join(format!("java-{}", version))`?
    // Start by checking what the Rust side expects.
    // Rust: `download_and_install_java(version, install_dir, ...)`
    // It creates `java-{version}` inside `install_dir`.
    // So we should pass the base dir? No, I should verify what Rust does.
    // Rust: `let target_dir = install_dir.join(format!("java-{}", version));`
    // So if passing `.../runtimes`, it creates `.../runtimes/java-21`.
    
    // My `check_java_status` takes `root: &Path`.
    // It recursively searches `root`.
    // So if I pass `.../runtimes/java-21`, it searches there.
    
    final expectedDir = p.join(installBaseDir.path, "java-$versionStr");
    
    logService.log("Checking for Java $majorVersion at: $expectedDir", category: "JAVA");

    if (Directory(expectedDir).existsSync()) {
      final existingPath = await NativeApi().checkJavaStatus(expectedDir);
      if (existingPath != null && existingPath.isNotEmpty) {
        logService.log("Found valid Java $majorVersion at: $existingPath", category: "JAVA");
        return existingPath;
      }
      logService.log("Java directory exists but valid binary not found or corrupted.", level: Level.warning, category: "JAVA");
    } else {
      logService.log("Java directory not found.", category: "JAVA");
    }

    // 2. Install if missing
    logService.log("Installing Java $majorVersion...", category: "JAVA");
    
    // Ensure base directory exists
    if (!installBaseDir.existsSync()) {
      installBaseDir.createSync(recursive: true);
    }

    // Call Native Installer
    // Note: Rust's install_java_runtime takes (version, installDir, callback).
    // And it creates the subdir `java-$version` inside `installDir`.
    // So we should pass `installBaseDir.path`.
    
    try {
      final installedPath = await NativeApi().installJavaRuntime(
          majorVersion, 
          installBaseDir.path, 
          onProgress: (p) {
            if (onProgress != null) onProgress(p);
            // logService.log("Java Install Progress: ${(p * 100).toStringAsFixed(1)}%", category: "JAVA");
          }
      );
      
      logService.log("Java $majorVersion installed successfully at: $installedPath", category: "JAVA");
      return installedPath;
    } catch (e) {
      logService.log("Failed to install Java $majorVersion", error: e, level: Level.error, category: "JAVA");
      rethrow;
    }
  }

  Future<Directory> _getJavaInstallBaseDir() async {
    // We want to store java runtimes in a dedicated folder.
    // e.g. /app/runtimes/java
    // Use the same base as game directory or specific launcher data dir?
    // Let's use `local_database.dart` to get a data path or just use a standard one relative to exec or app data.
    
    // For now, let's put it in `runtimes` next to `instances` or `gamedata`.
    // Launcher usually runs from a portable folder or installed.
    // Let's stick effectively to `Directory.current/runtimes` for portable logic 
    // or use `getApplicationDocumentsDirectory` if we want strict separation.
    // Given the context of "CrystalTidesSMP", it likely wants to keep things self-contained.
    
    // We can import `path_provider` if we want, but let's check `database_service.dart` or `main.dart` for convention.
    // Usage in `process_runner.dart` uses `gameDirectory`. 
    // Let's create `runtimes` inside the main data folder.
    // But where is the main data folder?
    // Let's default to `Directory.current/runtimes` for now, assuming the launcher is running from its dir.
    
    return Directory(p.join(Directory.current.path, 'runtimes', 'java'));
  }

  /// Returns the recommended Java major version for a given Minecraft version.
  int getJavaVersionForMinecraft(String mcVersion) {
    // Basic heuristic
    if (mcVersion.startsWith("1.21")) return 21;
    if (mcVersion.startsWith("1.20.6")) return 21; // 1.20.6 also requires 21
    if (mcVersion.startsWith("1.20")) return 17;
    if (mcVersion.startsWith("1.19")) return 17;
    if (mcVersion.startsWith("1.18")) return 17;
    if (mcVersion.startsWith("1.17")) return 16; // strict 16 usually, but 17 often works? vanilla 1.17 needs 16.
    // 1.16 and older -> 8
    return 8;
  }
}
