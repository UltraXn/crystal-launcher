import 'dart:ffi';
import 'dart:io';
import 'package:ffi/ffi.dart';
import 'package:path/path.dart' as p;
import 'package:logger/logger.dart';

typedef PerformUninstallFunc = Int32 Function();
typedef PerformUninstall = int Function();

typedef ScheduleDeletionFunc = Int32 Function(Pointer<Utf8> installDir);
typedef ScheduleDeletion = int Function(Pointer<Utf8> installDir);

class UninstallationService {
  final _logger = Logger();
  late DynamicLibrary _nativeLib;

  UninstallationService() {
    _initNative();
  }

  void _initNative() {
    final exeDir = p.dirname(Platform.resolvedExecutable);
    
    final dllCandidates = [
      'installer_native.dll',
      p.join(exeDir, 'installer_native.dll'),
      p.join(Directory.current.path, 'installer_native.dll'),
    ];

    String? dllPath;
    for (var path in dllCandidates) {
      if (path.contains(Platform.pathSeparator) && File(path).existsSync()) {
        dllPath = path;
        break;
      }
    }
    
    dllPath ??= 'installer_native.dll';
    _nativeLib = DynamicLibrary.open(dllPath);
  }

  Future<bool> isAppRunning() async {
    try {
      final result = await Process.run('tasklist', ['/FI', 'IMAGENAME eq crystal_launcher.exe', '/FO', 'CSV', '/NH']);
      return result.stdout.toString().contains('crystal_launcher.exe');
    } catch (e) {
      _logger.e("Error checking process: $e");
      return false;
    }
  }

  Future<void> startUninstall(Function(double) onProgress, {String? installDir}) async {
    try {
      onProgress(0.05);

      if (await isAppRunning()) {
        throw Exception("CON_RUNNING");
      }
      
      onProgress(0.1);
      
      final performUninstall = _nativeLib
          .lookup<NativeFunction<PerformUninstallFunc>>('perform_uninstallation')
          .asFunction<PerformUninstall>();

      // 1. & 2. Remove Registry and Shortcuts (Combined in Rust)
      _logger.i("Performing native uninstallation steps...");
      final result = performUninstall();
      
      if (result != 1) {
        _logger.w("Native uninstallation returned success code: $result");
      }
      
      onProgress(0.6);

      // 3. Prepare self-deletion script via Rust
      _logger.i("Scheduling native directory deletion...");
      await _scheduleNativeCleanup(installDir);
      onProgress(1.0);
    } catch (e) {
      _logger.e("Uninstallation error: $e");
      rethrow;
    }
  }

  Future<void> _scheduleNativeCleanup(String? explicitInstallDir) async {
    final exePath = Platform.resolvedExecutable;
    // Use explicit directory if provided (from bootstrapper), otherwise fallback to exe dir
    final installDir = explicitInstallDir ?? p.dirname(exePath);
    
    _logger.i("Targeting directory for deletion: $installDir");

    final scheduleDeletion = _nativeLib
        .lookup<NativeFunction<ScheduleDeletionFunc>>('schedule_self_deletion')
        .asFunction<ScheduleDeletion>();

    final dirPtr = installDir.toNativeUtf8();
    final result = scheduleDeletion(dirPtr);
    calloc.free(dirPtr);

    if (result != 1) {
      _logger.e("Failed to schedule native cleanup: code $result");
    }
  }
}
