import 'package:package_info_plus/package_info_plus.dart';
import 'dart:async';
import 'dart:ffi';
import 'dart:io';
import 'package:ffi/ffi.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart'; // For compute
import 'package:path/path.dart' as p;

import 'log_service.dart';
import 'package:logger/logger.dart';

typedef ExtractArchiveFunc = Int32 Function(
    Pointer<Utf8> archivePath, Pointer<Utf8> outputPath);
typedef ExtractArchive = int Function(
    Pointer<Utf8> archivePath, Pointer<Utf8> outputPath);

// Request object for the isolate
class ExtractionRequest {
  final String zipPath;
  final String targetPath;
  final String dllPath;

  ExtractionRequest(
      {required this.zipPath, required this.targetPath, required this.dllPath});
}

// Top-level function for compute
int _extractInIsolate(ExtractionRequest request) {
  try {
    DynamicLibrary nativeLib;
    if (Platform.isWindows) {
      nativeLib = DynamicLibrary.open(request.dllPath);
    } else {
      return -9; // Unsupported OS
    }

    final extractArchive = nativeLib
        .lookup<NativeFunction<ExtractArchiveFunc>>('extract_archive')
        .asFunction<ExtractArchive>();

    final archivePtr = request.zipPath.toNativeUtf8();
    final outputPtr = request.targetPath.toNativeUtf8();

    final result = extractArchive(archivePtr, outputPtr);

    calloc.free(archivePtr);
    calloc.free(outputPtr);

    return result;
  } catch (e) {
    // We can't easily use LogService here if it's singleton in another isolate, 
    // but we can print and catch it in the caller.
    debugPrint("Isolate Extraction Error: $e");
    return -10; // Exception in isolate (DLL load fail?)
  }
}

class InstallationService {
  
  Future<String> getInstallationPath() async {
    if (Platform.isWindows) {
      final userProfile = Platform.environment['USERPROFILE'];
      if (userProfile != null) {
        final path = p.join(userProfile, '.crystaltides');
        logService.log("📂 Default installation path: $path", category: "STORAGE");
        return path;
      }
    }
    return "C:\\CrystalTidesSMP"; // Fallback
  }

  Future<String?> pickInstallationPath() async {
    String? selectedDirectory = await FilePicker.platform.getDirectoryPath(
      dialogTitle: 'Seleccione la carpeta de instalación',
    );
    if (selectedDirectory != null) {
      logService.log("📂 User selected path: $selectedDirectory", category: "STORAGE");
    }
    return selectedDirectory;
  }

  // Returns:
  // 1: Success
  // < 0: Error Code
  Future<int> startInstall(
      String targetPath, Function(double) onProgress) async {
    
    logService.log("🛠️ Starting installation process to $targetPath", category: "SYSTEM");
    
    // 1. Locate the payload and DLL.
    String? zipPath;
    String? dllPath;

    final exeDir = p.dirname(Platform.resolvedExecutable);
    
    // Potential locations for payload
    final zipCandidates = [
      p.join(Directory.current.path, 'installer_payload.zip'), // Dev/Local
      p.join(exeDir, 'data', 'flutter_assets', 'assets', 'payload',
          'game_payload.zip'), // Release
      p.join(exeDir, 'assets', 'payload', 'game_payload.zip'),
    ];

    for (var path in zipCandidates) {
      if (File(path).existsSync()) {
        zipPath = path;
        logService.log("📦 Payload found at: $path", category: "STORAGE");
        break;
      }
    }

    if (zipPath == null) {
      logService.log("❌ CRITICAL: Payload ZIP not found in candidates: $zipCandidates", level: Level.error, category: "STORAGE");
      return -11; // Payload not found
    }

    // Potential locations for DLL
    final dllCandidates = [
      'installer_native.dll', // System path or side-by-side
      p.join(exeDir, 'installer_native.dll'),
      p.join(Directory.current.path, 'installer_native.dll'),
    ];

    for (var path in dllCandidates) {
      if (path.contains(Platform.pathSeparator) && File(path).existsSync()) {
        dllPath = path;
        logService.log("⚙️ DLL found at: $path", category: "SYSTEM");
        break;
      }
    }
    dllPath ??= 'installer_native.dll';

    // UI Updates
    onProgress(0.1);
    await Future.delayed(const Duration(milliseconds: 300));
    onProgress(0.2); // Syncing...

    // Create dir
    try {
      final dir = Directory(targetPath);
      if (!dir.existsSync()) {
        logService.log("📁 Creating target directory...", category: "STORAGE");
        dir.createSync(recursive: true);
      }
    } catch (e) {
      logService.log("❌ Failed to create target dir: $e", level: Level.error, category: "STORAGE");
      return -51; // Dart Create error
    }

    onProgress(0.4); // Configuring...

    // Use compute to run in background
    final request = ExtractionRequest(
      zipPath: zipPath,
      targetPath: targetPath,
      dllPath: dllPath,
    );

    logService.log("🔩 Extracting payload in isolate...", category: "SYSTEM");
    final result = await compute(_extractInIsolate, request);

    if (result == 1) {
      logService.log("✨ Extraction successful", category: "SYSTEM");
      onProgress(0.9);
      
      
      // Registry uninstaller in Windows
      if (Platform.isWindows) {
        try {
          await _registerUninstaller(targetPath);
        } catch (e) {
          logService.log("⚠️ Could not register uninstaller in registry: $e", level: Level.warning, category: "SYSTEM");
        }
        
        try {
          await _createShortcuts(targetPath);
        } catch (e) {
          logService.log("⚠️ Could not create shortcuts: $e", level: Level.warning, category: "SYSTEM");
        }
      }
      
      onProgress(1.0);
    } else {
      logService.log("❌ Extraction failed with code: $result", level: Level.error, category: "SYSTEM");
    }
    
    return result;
  }

  Future<void> _registerUninstaller(String installPath) async {
    logService.log("📝 Registering uninstaller in Windows Registry...", category: "SYSTEM");
    
    final packageInfo = await PackageInfo.fromPlatform();
    final appVersion = packageInfo.version;
    
    final exePath = p.join(installPath, "crystal_launcher.exe");
    final uninstallExePath = p.join(installPath, "crystal_uninstaller.exe");
    
    final psCommand = """
    \$registryPath = "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\CrystalLauncher"
    if (!(Test-Path \$registryPath)) { New-Item -Path \$registryPath -Force }
    New-ItemProperty -Path \$registryPath -Name "DisplayName" -Value "Crystal Launcher" -PropertyType String -Force
    New-ItemProperty -Path \$registryPath -Name "DisplayIcon" -Value "$exePath" -PropertyType String -Force
    New-ItemProperty -Path \$registryPath -Name "UninstallString" -Value '"$uninstallExePath"' -PropertyType String -Force
    New-ItemProperty -Path \$registryPath -Name "Publisher" -Value "CrystalTides" -PropertyType String -Force
    New-ItemProperty -Path \$registryPath -Name "DisplayVersion" -Value "$appVersion" -PropertyType String -Force
    """;

    final result = await Process.run('powershell', ['-Command', psCommand]);
    
    if (result.exitCode == 0) {
      logService.log("✅ Uninstaller registered successfully", category: "SYSTEM");
    } else {
      logService.log("❌ Failed to register uninstaller: ${result.stderr}", level: Level.error, category: "SYSTEM");
      throw Exception(result.stderr);
    }
  }

  Future<void> _createShortcuts(String installPath) async {
    logService.log("📝 Creating shortcuts...", category: "SYSTEM");
    final exePath = p.join(installPath, "crystal_launcher.exe");
    
    final psCommand = """
    \$WshShell = New-Object -comObject WScript.Shell
    
    # Desktop Shortcut
    \$DesktopPath = [Environment]::GetFolderPath("Desktop")
    \$Shortcut = \$WshShell.CreateShortcut("\$DesktopPath\\Crystal Launcher.lnk")
    \$Shortcut.TargetPath = "$exePath"
    \$Shortcut.WorkingDirectory = "$installPath"
    \$Shortcut.Save()
    
    # Start Menu Shortcut
    \$StartMenuPath = [Environment]::GetFolderPath("StartMenu")
    \$ProgramDir = "\$StartMenuPath\\Programs\\CrystalTides"
    if (!(Test-Path \$ProgramDir)) { New-Item -ItemType Directory -Path \$ProgramDir -Force }
    \$ShortcutSM = \$WshShell.CreateShortcut("\$ProgramDir\\Crystal Launcher.lnk")
    \$ShortcutSM.TargetPath = "$exePath"
    \$ShortcutSM.WorkingDirectory = "$installPath"
    \$ShortcutSM.Save()
    """;

    final result = await Process.run('powershell', ['-Command', psCommand]);
    
    if (result.exitCode == 0) {
      logService.log("✅ Shortcuts created successfully", category: "SYSTEM");
    } else {
      logService.log("❌ Failed to create shortcuts: ${result.stderr}", level: Level.error, category: "SYSTEM");
    }
  }

  Future<void> launchApp(String installPath) async {
    const exeName = "crystal_launcher.exe";
    final exePath = p.join(installPath, exeName);
    
    logService.log("🚀 Launching application from $installPath", category: "GAME");
    
    if (File(exePath).existsSync()) {
      logService.log("✅ Main executable found: $exePath", category: "GAME");
      await Process.start(exePath, [], runInShell: true, workingDirectory: installPath);
    } else {
      logService.log("⚠️ Launcher not found at $exePath. Searching for alternatives...", level: Level.warning, category: "GAME");
      try {
        final dir = Directory(installPath);
        final exes = dir.listSync().whereType<File>().where(
            (f) => f.path.endsWith('.exe') && !f.path.contains("uninstall"));
        if (exes.isNotEmpty) {
          final chosen = exes.first.path;
          logService.log("🔔 Launching alternative executable: $chosen", category: "GAME");
          await Process.start(chosen, [], runInShell: true, workingDirectory: installPath);
        } else {
          logService.log("❌ No executables found in $installPath", level: Level.error, category: "GAME");
        }
      } catch (e) {
        logService.log("❌ Failed to launch alternative: $e", level: Level.error, category: "GAME");
      }
    }
  }

}
