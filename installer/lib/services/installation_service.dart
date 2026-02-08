import 'dart:async';
import 'dart:ffi';
import 'dart:io';
import 'package:ffi/ffi.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart'; // For compute
import 'package:path/path.dart' as p;

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
    debugPrint("Isolate Error: $e");
    return -10; // Exception in isolate (DLL load fail?)
  }
}

class InstallationService {
  
  // We no longer load the DLL in the constructor for the main isolate.
  // We load it in the background isolate.

  Future<String> getInstallationPath() async {
    if (Platform.isWindows) {
      final userProfile = Platform.environment['USERPROFILE'];
      if (userProfile != null) {
        return p.join(userProfile, '.crystaltides');
      }
    }
    return "C:\\CrystalTidesSMP"; // Fallback
  }

  Future<String?> pickInstallationPath() async {
    String? selectedDirectory = await FilePicker.platform.getDirectoryPath(
      dialogTitle: 'Seleccione la carpeta de instalación',
    );
    return selectedDirectory;
  }

  // Returns:
  // 1: Success
  // < 0: Error Code
  Future<int> startInstall(
      String targetPath, Function(double) onProgress) async {
    
    // 1. Locate the payload and DLL.
    String? zipPath;
    String? dllPath;

    final exeDir = p.dirname(Platform.resolvedExecutable);
    
    // Potential locations for payload
    final zipCandidates = [
      p.join(Directory.current.path, 'installer_payload.zip'), // Dev/Local
      p.join(exeDir, 'data', 'flutter_assets', 'assets', 'payload',
          'game_payload.zip'), // Release
      // Also check standard asset path just in case
      p.join(exeDir, 'assets', 'payload', 'game_payload.zip'),
    ];

    for (var path in zipCandidates) {
      if (File(path).existsSync()) {
        zipPath = path;
        break;
      }
    }

    if (zipPath == null) {
      debugPrint("CRITICAL: Payload ZIP not found in candidates: $zipCandidates");
      return -11; // Payload not found
    }

    // Potential locations for DLL
    final dllCandidates = [
      'installer_native.dll', // System path or side-by-side
      p.join(exeDir, 'installer_native.dll'),
      p.join(Directory.current.path, 'installer_native.dll'),
    ];

    for (var path in dllCandidates) {
      // For 'installer_native.dll' (no path), we can't check existsSync easily unless we know cwd.
      // But we can check absolute paths.
      if (path.contains(Platform.pathSeparator) && File(path).existsSync()) {
        dllPath = path;
        break;
      }
    }
    // Fallback to strict name if not found via absolute path
    dllPath ??= 'installer_native.dll';

    // UI Updates
    onProgress(0.1);
    await Future.delayed(const Duration(milliseconds: 300));
    onProgress(0.2); // Syncing...

    // We can verify permissions here or create dir
    try {
      final dir = Directory(targetPath);
      if (!dir.existsSync()) {
        dir.createSync(recursive: true);
      }
    } catch (e) {
      debugPrint("Failed to create target dir: $e");
      return -51; // Dart Create error
    }

    onProgress(0.4); // Configuring...

    // Use compute to run in background
    final request = ExtractionRequest(
      zipPath: zipPath,
      targetPath: targetPath,
      dllPath: dllPath,
    );

    // This runs in a separate isolate and won't freeze UI
    final result = await compute(_extractInIsolate, request);

    if (result == 1) {
      onProgress(1.0);
    }
    
    return result;
  }

  Future<void> launchApp(String installPath) async {
    const exeName = "crystal_launcher.exe";
    final exePath = p.join(installPath, exeName);
    
    if (File(exePath).existsSync()) {
      await Process.start(exePath, [], runInShell: true);
    } else {
      debugPrint("Launcher not found at $exePath");
      try {
        final dir = Directory(installPath);
        final exes = dir.listSync().whereType<File>().where(
            (f) => f.path.endsWith('.exe') && !f.path.contains("uninstall"));
        if (exes.isNotEmpty) {
          // Sort by name length or something to avoid uninstaller?
          // crystal_launcher.exe is preferred.
          await Process.start(exes.first.path, [], runInShell: true);
        }
      } catch (e) {
        debugPrint("Failed to launch: $e");
      }
    }
  }
}
