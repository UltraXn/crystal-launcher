import 'dart:ffi';
import 'dart:io';
import 'dart:convert';
import 'dart:isolate';
import 'package:ffi/ffi.dart';
import 'package:path/path.dart' as p;
import '../services/log_service.dart';

// FFI Type Definitions
typedef UploadModsParallelNative = Int32 Function(
  Pointer<Utf8> filesJson,
  Pointer<Utf8> accessKey,
  Pointer<Utf8> secretKey,
  Pointer<Utf8> endpoint,
  Pointer<Utf8> bucket,
  Int32 maxConcurrent,
  Pointer<NativeFunction<Void Function(Int32)>> callback,
);

typedef UploadModsParallelDart = int Function(
  Pointer<Utf8> filesJson,
  Pointer<Utf8> accessKey,
  Pointer<Utf8> secretKey,
  Pointer<Utf8> endpoint,
  Pointer<Utf8> bucket,
  int maxConcurrent,
  Pointer<NativeFunction<Void Function(Int32)>> callback,
);

typedef DownloadModsParallelNative = Int32 Function(
  Pointer<Utf8> modsJson,
  Pointer<Utf8> outputDir,
  Int32 maxConcurrent,
  Pointer<NativeFunction<Void Function(Int32)>> callback,
);

typedef DownloadModsParallelDart = int Function(
  Pointer<Utf8> modsJson,
  Pointer<Utf8> outputDir,
  int maxConcurrent,
  Pointer<NativeFunction<Void Function(Int32)>> callback,
);

/// Native R2 Service using Rust FFI for parallel uploads/downloads
/// FFI calls are offloaded to a background isolate to prevent UI freezes.
class NativeR2Service {
  static final NativeR2Service _instance = NativeR2Service._internal();
  factory NativeR2Service() => _instance;

  final _logService = LogService();

  // Progress tracking
  int _currentProgress = 0;
  int _totalItems = 0;
  Function(int, int, String)? _progressCallback;
  int _lastProgressUpdate = 0;


  NativeR2Service._internal() {
    _verifyDll();
  }

  /// Verifies that the native DLL is present on startup
  void _verifyDll() {
    try {
      final path = _resolveDllPath();
      final lib = DynamicLibrary.open(path);
      // Basic check: can we find our functions?
      lib.lookup('upload_mods_parallel');
      lib.lookup('download_mods_parallel');
      _logService.log('✅ crystal_native.dll verified at: $path', category: 'RUST');
    } catch (e) {
      _logService.log('❌ Error verifying crystal_native.dll: $e', level: Level.error, category: 'RUST');
      // We don't throw here to avoid crashing the whole app, 
      // but the logs will clearly show the problem.
    }
  }

  static String _resolveDllPath() {
    const dllName = 'crystal_native.dll';
    final exeDir = p.dirname(Platform.resolvedExecutable);
    
    final candidates = [
      dllName,
      p.join(exeDir, dllName),
      p.join(Directory.current.path, dllName),
      // Fallback for development/build environment
      p.join(Directory.current.path, 'native', 'target', 'release', dllName),
    ];

    for (final path in candidates) {
      if (File(path).existsSync()) {
        return path;
      }
    }

    return dllName; // Fallback to system search
  }

  /// Upload multiple mods to R2 in parallel (runs in background isolate)
  Future<void> uploadModsBatch(
    List<String> filePaths,
    String accessKey,
    String secretKey,
    String endpoint,
    String bucket, {
    int maxConcurrent = 10,
    Function(int, int, String)? onProgress,
  }) async {
    _logService.log('🚀 Starting parallel upload of ${filePaths.length} mods...', category: 'RUST');
    
    _currentProgress = 0;
    _totalItems = filePaths.length;
    _progressCallback = onProgress;

    final filesJson = jsonEncode(filePaths);
    
    // Run FFI in background to keep UI responsive
    final receivePort = ReceivePort();

    await Isolate.spawn(
      _uploadIsolateEntry,
      _UploadParams(
        filesJson: filesJson,
        accessKey: accessKey,
        secretKey: secretKey,
        endpoint: endpoint,
        bucket: bucket,
        maxConcurrent: maxConcurrent,
        sendPort: receivePort.sendPort,
      ),
    );

    int? result;
    await for (final message in receivePort) {
      if (message is _ProgressMessage) {
        _currentProgress = message.index + 1;
        final now = DateTime.now().millisecondsSinceEpoch;
        if (now - _lastProgressUpdate < 50 && _currentProgress < _totalItems) {
          continue;
        }
        _lastProgressUpdate = now;
        _progressCallback?.call(
          _currentProgress,
          _totalItems,
          'Uploading mod $_currentProgress/$_totalItems',
        );
      } else if (message is _ResultMessage) {
        result = message.code;
        receivePort.close();
      }
    }

    if (result == null) {
      throw Exception('Rust upload isolate exited unexpectedly. Check if crystal_native.dll is missing.');
    } else if (result != 0) {
      throw Exception('Rust upload failed with code: $result');
    }
    
    _logService.log('✅ Parallel upload completed successfully', category: 'RUST');
  }

  /// Download multiple mods from R2 in parallel (runs in background isolate)
  Future<void> downloadModsBatch(
    List<Map<String, dynamic>> mods,
    String outputDir,
    {
      int maxConcurrent = 10,
      Function(int, int, String)? onProgress,
    }
  ) async {
    _logService.log('⬇️ Starting parallel download of ${mods.length} mods...', category: 'RUST');
    
    _currentProgress = 0;
    _totalItems = mods.length;
    _progressCallback = onProgress;

    final modsJson = jsonEncode(mods);
    
    // Run FFI in background to keep UI responsive
    final receivePort = ReceivePort();

    await Isolate.spawn(
      _downloadIsolateEntry,
      _DownloadParams(
        modsJson: modsJson,
        outputDir: outputDir,
        maxConcurrent: maxConcurrent,
        sendPort: receivePort.sendPort,
      ),
    );

    int? result;
    await for (final message in receivePort) {
      if (message is _ProgressMessage) {
        _currentProgress = message.index + 1;
        final now = DateTime.now().millisecondsSinceEpoch;
        if (now - _lastProgressUpdate < 50 && _currentProgress < _totalItems) {
          continue;
        }
        _lastProgressUpdate = now;

        String modName = "unknown";
        if (message.index >= 0 && message.index < mods.length) {
          modName = mods[message.index]['name'] ?? "unknown";
        }

        _progressCallback?.call(
          _currentProgress,
          _totalItems,
          'Downloaded: $modName',
        );
      } else if (message is _ResultMessage) {
        result = message.code;
        receivePort.close();
      }
    }

    if (result == null) {
      throw Exception('Rust download isolate exited unexpectedly. Check if crystal_native.dll is missing.');
    } else if (result != 0) {
      throw Exception('Rust download failed with code: $result');
    }
    
    _logService.log('✅ Parallel download completed successfully', category: 'RUST');
  }
}

// --- Isolate entry points and message types ---

class _ProgressMessage {
  final int index;
  _ProgressMessage(this.index);
}

class _ResultMessage {
  final int code;
  _ResultMessage(this.code);
}

class _UploadParams {
  final String filesJson;
  final String accessKey;
  final String secretKey;
  final String endpoint;
  final String bucket;
  final int maxConcurrent;
  final SendPort sendPort;

  _UploadParams({
    required this.filesJson,
    required this.accessKey,
    required this.secretKey,
    required this.endpoint,
    required this.bucket,
    required this.maxConcurrent,
    required this.sendPort,
  });
}

class _DownloadParams {
  final String modsJson;
  final String outputDir;
  final int maxConcurrent;
  final SendPort sendPort;

  _DownloadParams({
    required this.modsJson,
    required this.outputDir,
    required this.maxConcurrent,
    required this.sendPort,
  });
}

/// Runs the upload FFI call in a background isolate
void _uploadIsolateEntry(_UploadParams params) {
  NativeCallable<Void Function(Int32)>? callable;
  Pointer<Utf8>? filesPtr;
  Pointer<Utf8>? accessKeyPtr;
  Pointer<Utf8>? secretKeyPtr;
  Pointer<Utf8>? endpointPtr;
  Pointer<Utf8>? bucketPtr;

  try {
    final path = NativeR2Service._resolveDllPath();
    final lib = DynamicLibrary.open(path);
    final uploadFn = lib.lookupFunction<
      UploadModsParallelNative,
      UploadModsParallelDart
    >('upload_mods_parallel');

    filesPtr = params.filesJson.toNativeUtf8();
    accessKeyPtr = params.accessKey.toNativeUtf8();
    secretKeyPtr = params.secretKey.toNativeUtf8();
    endpointPtr = params.endpoint.toNativeUtf8();
    bucketPtr = params.bucket.toNativeUtf8();

    callable = NativeCallable<Void Function(Int32)>.listener((int index) {
      params.sendPort.send(_ProgressMessage(index));
    });

    final result = uploadFn(
      filesPtr,
      accessKeyPtr,
      secretKeyPtr,
      endpointPtr,
      bucketPtr,
      params.maxConcurrent,
      callable.nativeFunction,
    );
    params.sendPort.send(_ResultMessage(result));
  } catch (e) {
    // Send a negative code to indicate FFI/Loading error
    params.sendPort.send(_ResultMessage(-999));
  } finally {
    callable?.close();
    if (filesPtr != null) malloc.free(filesPtr);
    if (accessKeyPtr != null) malloc.free(accessKeyPtr);
    if (secretKeyPtr != null) malloc.free(secretKeyPtr);
    if (endpointPtr != null) malloc.free(endpointPtr);
    if (bucketPtr != null) malloc.free(bucketPtr);
  }
}

/// Runs the download FFI call in a background isolate
void _downloadIsolateEntry(_DownloadParams params) {
  NativeCallable<Void Function(Int32)>? callable;
  Pointer<Utf8>? modsPtr;
  Pointer<Utf8>? outputDirPtr;

  try {
    final path = NativeR2Service._resolveDllPath();
    final lib = DynamicLibrary.open(path);
    final downloadFn = lib.lookupFunction<
      DownloadModsParallelNative,
      DownloadModsParallelDart
    >('download_mods_parallel');

    modsPtr = params.modsJson.toNativeUtf8();
    outputDirPtr = params.outputDir.toNativeUtf8();

    callable = NativeCallable<Void Function(Int32)>.listener((int index) {
      params.sendPort.send(_ProgressMessage(index));
    });

    final result = downloadFn(
      modsPtr,
      outputDirPtr,
      params.maxConcurrent,
      callable.nativeFunction,
    );
    params.sendPort.send(_ResultMessage(result));
  } catch (e) {
    params.sendPort.send(_ResultMessage(-999));
  } finally {
    callable?.close();
    if (modsPtr != null) malloc.free(modsPtr);
    if (outputDirPtr != null) malloc.free(outputDirPtr);
  }
}
