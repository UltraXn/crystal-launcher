import 'dart:ffi';
import 'dart:convert';
import 'package:ffi/ffi.dart';
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
class NativeR2Service {
  static final NativeR2Service _instance = NativeR2Service._internal();
  factory NativeR2Service() => _instance;

  late final DynamicLibrary _lib;
  late final UploadModsParallelDart _uploadModsParallel;
  late final DownloadModsParallelDart _downloadModsParallel;
  final _logService = LogService();

  // Progress tracking
  int _currentProgress = 0;
  int _totalItems = 0;
  Function(int, int, String)? _progressCallback;
  int _lastProgressUpdate = 0;


  NativeR2Service._internal() {
    try {
      _lib = DynamicLibrary.open('CrystalNative.dll');
      
      _uploadModsParallel = _lib.lookupFunction<
        UploadModsParallelNative,
        UploadModsParallelDart
      >('upload_mods_parallel');

      _downloadModsParallel = _lib.lookupFunction<
        DownloadModsParallelNative,
        DownloadModsParallelDart
      >('download_mods_parallel');

      _logService.log('✅ Rust R2 Service initialized', category: 'RUST');
    } catch (e) {
      _logService.log('❌ Failed to load Rust R2 Service: $e', category: 'RUST');
      rethrow;
    }
  }

  /// Upload multiple mods to R2 in parallel
  /// 
  /// [filePaths] - List of absolute file paths to upload
  /// [accessKey] - R2 Access Key ID
  /// [secretKey] - R2 Secret Access Key
  /// [endpoint] - R2 endpoint (e.g., "xxx.r2.cloudflarestorage.com")
  /// [bucket] - Bucket name
  /// [maxConcurrent] - Maximum concurrent uploads (default: 10)
  /// [onProgress] - Progress callback (current, total, message)
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
    
    final filesPtr = filesJson.toNativeUtf8();
    final accessKeyPtr = accessKey.toNativeUtf8();
    final secretKeyPtr = secretKey.toNativeUtf8();
    final endpointPtr = endpoint.toNativeUtf8();
    final bucketPtr = bucket.toNativeUtf8();
    
    // Create thread-safe progress callback
    final callable = NativeCallable<Void Function(Int32)>.listener((int index) {
      _currentProgress = index + 1;
      
      final now = DateTime.now().millisecondsSinceEpoch;
      if (now - _lastProgressUpdate < 50 && _currentProgress < _totalItems) {
        return;
      }
      _lastProgressUpdate = now;

      if (_progressCallback != null) {
        _progressCallback!(
          _currentProgress,
          _totalItems,
          'Uploading mod $_currentProgress/$_totalItems',
        );
      }
    });

    final callback = callable.nativeFunction;
    
    try {
      final result = _uploadModsParallel(
        filesPtr,
        accessKeyPtr,
        secretKeyPtr,
        endpointPtr,
        bucketPtr,
        maxConcurrent,
        callback,
      );
      
      if (result != 0) {
        throw Exception('Rust upload failed with code: $result');
      }
      
      _logService.log('✅ Parallel upload completed successfully', category: 'RUST');
    } finally {
      callable.close();
      malloc.free(filesPtr);
      malloc.free(accessKeyPtr);
      malloc.free(secretKeyPtr);
      malloc.free(endpointPtr);
      malloc.free(bucketPtr);
    }
  }

  /// Download multiple mods from R2 in parallel with SHA1 verification
  /// 
  /// [mods] - List of mod info maps with 'name', 'url', and 'sha1' keys
  /// [outputDir] - Directory to save downloaded files
  /// [maxConcurrent] - Maximum concurrent downloads (default: 10)
  /// [onProgress] - Progress callback (current, total, message)
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
    
    final modsPtr = modsJson.toNativeUtf8();
    final outputDirPtr = outputDir.toNativeUtf8();
    
    // Create thread-safe progress callback
    final callable = NativeCallable<Void Function(Int32)>.listener((int index) {
      _currentProgress = index + 1;
      
      final now = DateTime.now().millisecondsSinceEpoch;
      if (now - _lastProgressUpdate < 50 && _currentProgress < _totalItems) {
        return;
      }
      _lastProgressUpdate = now;

      String modName = "unknown";
      if (index >= 0 && index < mods.length) {
        modName = mods[index]['name'] ?? "unknown";
      }

      if (_progressCallback != null) {
        _progressCallback!(
          _currentProgress,
          _totalItems,
          'Downloaded: $modName',
        );
      }
    });

    final callback = callable.nativeFunction;
    
    try {
      final result = _downloadModsParallel(
        modsPtr,
        outputDirPtr,
        maxConcurrent,
        callback,
      );
      
      if (result != 0) {
        throw Exception('Rust download failed with code: $result');
      }
      
      _logService.log('✅ Parallel download completed successfully', category: 'RUST');
    } finally {
      callable.close();
      malloc.free(modsPtr);
      malloc.free(outputDirPtr);
    }
  }
}
