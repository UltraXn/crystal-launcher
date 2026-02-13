

import 'dart:ffi';
import 'dart:io';
import 'package:ffi/ffi.dart';


typedef InstallNeoForgeFunc = Int32 Function(
  Pointer<Utf8> neoVersion,
  Pointer<Utf8> gameDir,
  Pointer<Utf8> javaPath,
);

typedef InstallNeoForge = int Function(
  Pointer<Utf8> neoVersion,
  Pointer<Utf8> gameDir,
  Pointer<Utf8> javaPath,
);

typedef CalculateSha1Func = Pointer<Utf8> Function(Pointer<Utf8> path);
typedef CalculateSha1 = Pointer<Utf8> Function(Pointer<Utf8> path);

typedef UploadToGitHubFunc = Int32 Function(
  Pointer<Utf8> repo,
  Pointer<Utf8> tag,
  Pointer<Utf8> filePath,
  Pointer<Utf8> token,
);

typedef UploadToGitHub = int Function(
  Pointer<Utf8> repo,
  Pointer<Utf8> tag,
  Pointer<Utf8> filePath,
  Pointer<Utf8> token,
);

// Java Manager Typedefs
// Callback: void callback(float progress)
typedef JavaProgressCallback = Void Function(Float progress);

typedef InstallJavaRuntimeFunc = Pointer<Utf8> Function(
  Int32 version,
  Pointer<Utf8> installDir,
  Pointer<NativeFunction<JavaProgressCallback>> callback,
);

typedef InstallJavaRuntime = Pointer<Utf8> Function(
  int version,
  Pointer<Utf8> installDir,
  Pointer<NativeFunction<JavaProgressCallback>> callback,
);

typedef CheckJavaStatusFunc = Pointer<Utf8> Function(
  Pointer<Utf8> installDir
);

typedef CheckJavaStatus = Pointer<Utf8> Function(
  Pointer<Utf8> installDir
);

typedef CheckSingleInstanceFunc = Int32 Function();
typedef CheckSingleInstance = int Function();

typedef SetPriorityFunc = Int32 Function();
typedef SetPriority = int Function();

typedef FreeStringFunc = Void Function(Pointer<Utf8> str);
typedef FreeString = void Function(Pointer<Utf8> str);

class NativeApi {
  static final NativeApi _instance = NativeApi._internal();
  factory NativeApi() => _instance;
  NativeApi._internal();

  late DynamicLibrary _lib;
  late InstallNeoForge _installNeoForge;
  late CalculateSha1 _calculateSha1;
  late UploadToGitHub _uploadToGitHub;
  late FreeString _freeString;
  late CheckSingleInstance _checkSingleInstance;
  late SetPriority _setHighPriority;
  late SetPriority _setNormalPriority;

  bool _initialized = false;

  void init() {
    if (_initialized) return;

    var libraryPath = 'crystal_native.dll';
    if (Platform.isWindows) {
      libraryPath = 'crystal_native.dll'; 
    } else if (Platform.isLinux) {
      libraryPath = 'libnative.so';
    } else if (Platform.isMacOS) {
      libraryPath = 'libnative.dylib';
    }

    try {
      _lib = DynamicLibrary.open(libraryPath);
    } catch (e) {
      try {
        _lib = DynamicLibrary.open('native/target/release/crystal_native.dll');
      } catch (e2) {
        throw Exception("Could not load native library 'crystal_native.dll': $e\n$e2");
      }
    }

    _installNeoForge = _lib
        .lookup<NativeFunction<InstallNeoForgeFunc>>('install_neoforge')
        .asFunction();

    _calculateSha1 = _lib
        .lookup<NativeFunction<CalculateSha1Func>>('calculate_sha1')
        .asFunction();

    try {
      _uploadToGitHub = _lib
          .lookup<NativeFunction<UploadToGitHubFunc>>('upload_to_github')
          .asFunction();
    } catch (e) {
      stderr.writeln("Warning: upload_to_github not found in DLL.");
    }

    try {
      _installJavaRuntime = _lib
          .lookup<NativeFunction<InstallJavaRuntimeFunc>>('install_java_runtime')
          .asFunction();
      _checkJavaStatus = _lib
          .lookup<NativeFunction<CheckJavaStatusFunc>>('check_java_status')
          .asFunction();
       _freeString = _lib
          .lookup<NativeFunction<FreeStringFunc>>('free_string')
          .asFunction();
    } catch (e) {
      stderr.writeln("Warning: Java Manager functions or free_string not found in DLL: $e");
    }

    try {
      _checkSingleInstance = _lib
          .lookup<NativeFunction<CheckSingleInstanceFunc>>('check_single_instance')
          .asFunction();
      _setHighPriority = _lib
          .lookup<NativeFunction<SetPriorityFunc>>('set_high_priority')
          .asFunction();
      _setNormalPriority = _lib
          .lookup<NativeFunction<SetPriorityFunc>>('set_normal_priority')
          .asFunction();
    } catch (e) {
      stderr.writeln("Warning: Single instance or Priority functions not found in DLL: $e");
    }

    _initialized = true;
  }

  late InstallJavaRuntime _installJavaRuntime;
  late CheckJavaStatus _checkJavaStatus;

  Future<int> uploadToGitHub({
    required String repo,
    required String tag,
    required String filePath,
    required String token,
  }) async {
    if (!_initialized) init();

    final repoPtr = repo.toNativeUtf8();
    final tagPtr = tag.toNativeUtf8();
    final filePathPtr = filePath.toNativeUtf8();
    final tokenPtr = token.toNativeUtf8();

    try {
      return _uploadToGitHub(repoPtr, tagPtr, filePathPtr, tokenPtr);
    } finally {
      calloc.free(repoPtr);
      calloc.free(tagPtr);
      calloc.free(filePathPtr);
      calloc.free(tokenPtr);
    }
  }

  Future<String?> checkJavaStatus(String installDir) async {
    if (!_initialized) init();

    final dirPtr = installDir.toNativeUtf8();
    try {
      final resultPtr = _checkJavaStatus(dirPtr);
      if (resultPtr == nullptr) return null;
      
      final path = resultPtr.toDartString();
      _freeString(resultPtr);
      return path;
    } catch (e) {
      stderr.writeln("Error checking java status: $e");
      return null;
    } finally {
      calloc.free(dirPtr);
    }
  }

  /// Installs Java. Because it blocks and uses callbacks, running in main isolate relies on FFI async capability 
  /// or we should just accept it blocks the UI thread if not run in Isolate.
  /// Since we want progress, we need to pass a callback.
  /// Passing Dart function to Rust requires `NativeCallable` (Dart 3.x) or legacy `fromFunction`.
  /// `NativeCallable.listener` is best for async callbacks from any thread.
  Future<String> installJavaRuntime(int version, String installDir, {void Function(double)? onProgress}) async {
    if (!_initialized) init();

    final dirPtr = installDir.toNativeUtf8();
    
    // Create reference to callback to keep it alive
    final nativeCallback = NativeCallable<JavaProgressCallback>.listener((double floatProgress) {
      if (onProgress != null) {
        onProgress(floatProgress);
      }
    });

    try {
      // NOTE: This blocks the calling thread (Isolate).
      // We accept it for now as per plan.
      
      final resultPtr = _installJavaRuntime(version, dirPtr, nativeCallback.nativeFunction);
      
      try {
        if (resultPtr == nullptr) throw Exception("Installation returned null");
        
        final result = resultPtr.toDartString();
        _freeString(resultPtr);
        
        if (result.startsWith("ERROR:")) {
           throw Exception(result);
        }
        return result;
      } finally {
        // Handled by _freeString above
      }

    } catch (e) {
      rethrow;
    } finally {
      nativeCallback.close(); // Clean up listener
      calloc.free(dirPtr);
    }
  }

  Future<String?> calculateFileHash(String filePath) async {
    if (!_initialized) init();

    final pathPtr = filePath.toNativeUtf8();
    try {
      final resultPtr = _calculateSha1(pathPtr);
      if (resultPtr == nullptr) return null;
      
      final hash = resultPtr.toDartString();
      return hash;
    } catch (e) {
      stderr.writeln("Error calculating hash: $e");
      return null;
    } finally {
      calloc.free(pathPtr);
    }
  }


  Future<int> installNeoForge({
    required String neoVersion,
    required String gameDir,
    required String javaPath,
  }) async {
    if (!_initialized) init();

    final neoVersionPtr = neoVersion.toNativeUtf8();
    final gameDirPtr = gameDir.toNativeUtf8();
    final javaPathPtr = javaPath.toNativeUtf8();

    try {
      return _installNeoForge(neoVersionPtr, gameDirPtr, javaPathPtr);
    } finally {
      calloc.free(neoVersionPtr);
      calloc.free(gameDirPtr);
      calloc.free(javaPathPtr);
    }
  }

  bool checkSingleInstance() {
    if (!_initialized) init();
    try {
      return _checkSingleInstance() == 1;
    } catch (e) {
      return true; // Fallback to "assuming we are fine" or handle error
    }
  }

  void setHighPriority() {
    if (!_initialized) init();
    try {
      _setHighPriority();
    } catch (_) {}
  }

  void setNormalPriority() {
    if (!_initialized) init();
    try {
      _setNormalPriority();
    } catch (_) {}
  }
}
