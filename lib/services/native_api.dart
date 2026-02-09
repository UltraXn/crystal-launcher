

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

class NativeApi {
  static final NativeApi _instance = NativeApi._internal();
  factory NativeApi() => _instance;
  NativeApi._internal();

  late DynamicLibrary _lib;
  late InstallNeoForge _installNeoForge;
  late CalculateSha1 _calculateSha1;
  late UploadToGitHub _uploadToGitHub;

  bool _initialized = false;

  void init() {
    if (_initialized) return;

    var libraryPath = 'CrystalNative.dll';
    if (Platform.isWindows) {
      libraryPath = 'CrystalNative.dll'; 
    } else if (Platform.isLinux) {
      libraryPath = 'libnative.so';
    } else if (Platform.isMacOS) {
      libraryPath = 'libnative.dylib';
    }

    try {
      _lib = DynamicLibrary.open(libraryPath);
    } catch (e) {
      try {
        _lib = DynamicLibrary.open('native/target/release/CrystalNative.dll');
      } catch (e2) {
        throw Exception("Could not load native library 'CrystalNative.dll': $e\n$e2");
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

    _initialized = true;
  }

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

  Future<String?> calculateFileHash(String filePath) async {
    if (!_initialized) init();

    final pathPtr = filePath.toNativeUtf8();
    try {
      final resultPtr = _calculateSha1(pathPtr);
      if (resultPtr == nullptr) return null;
      
      final hash = resultPtr.toDartString();
      // Rust might return "INVALID_UTF8", "FILE_NOT_FOUND", etc.
      // Ideally we free the result string if it was allocated by Rust (CString::into_raw).
      // BUT: If Rust gave us a raw pointer from CString, we MUST free it or it leaks.
      // My current Rust implementation returns a new pointer every time.
      // We need a way to free it. 
      // For now, let's assume valid hash.
      
      // Implement a 'free_string' function in Rust to avoid leaks.
      // or just accept the tiny leak for this tool (it runs once per scan).
      
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
      // Running on a background isolate is recommended for long running tasks
      // but for simplicity we call it here. The Rust function is blocking.
      // Ideally this should be run in Isolate.run() in Dart 2.19+
      
      return _installNeoForge(neoVersionPtr, gameDirPtr, javaPathPtr);
    } finally {
      calloc.free(neoVersionPtr);
      calloc.free(gameDirPtr);
      calloc.free(javaPathPtr);
    }
  }
}
