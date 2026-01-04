import 'dart:ffi' as ffi;
import 'dart:io' show File;
import 'package:ffi/ffi.dart';
import 'package:flutter/foundation.dart'; // Added for debugPrint

// FFI Signatures
typedef InitCoreFunc = ffi.Int32 Function();
typedef InitCore = int Function();

typedef CalculateSha1Func = ffi.Pointer<Utf8> Function(ffi.Pointer<Utf8>);
typedef CalculateSha1 = ffi.Pointer<Utf8> Function(ffi.Pointer<Utf8>);

typedef FreeStringFunc = ffi.Void Function(ffi.Pointer<Utf8>);
typedef FreeString = void Function(ffi.Pointer<Utf8>);

typedef RunLuaFunc = ffi.Pointer<Utf8> Function(ffi.Pointer<Utf8>);
typedef RunLua = ffi.Pointer<Utf8> Function(ffi.Pointer<Utf8>);

class NativeBridge {
  late ffi.DynamicLibrary _lib;
  late InitCore _initCore;
  late CalculateSha1 _calculateSha1;
  late FreeString _freeString;
  late RunLua _runLua;

  NativeBridge() {
    // Determine path based on debug/release (simplified for dev)
    var path = 'native/target/debug/CrystalNative.dll';
    if (!File(path).existsSync()) {
      path = 'native/target/release/CrystalNative.dll';
    }
    // Fallback allowing system lookup if needed
    try {
      _lib = ffi.DynamicLibrary.open(path);
    } catch (e) {
      // If relative path fails, try opening by name (requires dll in same folder or PATH)
      _lib = ffi.DynamicLibrary.open('CrystalNative.dll');
    }

    _initCore =
        _lib.lookup<ffi.NativeFunction<InitCoreFunc>>('init_core').asFunction();

    _calculateSha1 = _lib
        .lookup<ffi.NativeFunction<CalculateSha1Func>>('calculate_sha1')
        .asFunction();

    _freeString = _lib
        .lookup<ffi.NativeFunction<FreeStringFunc>>('free_string')
        .asFunction();

    _runLua =
        _lib.lookup<ffi.NativeFunction<RunLuaFunc>>('run_lua').asFunction();
  }

  bool init() {
    try {
      return _initCore() == 1;
    } catch (e) {
      debugPrint("Native Bridge Init Error: $e");
      return false;
    }
  }

  String calculateSha1(String path) {
    final pathPtr = path.toNativeUtf8();
    final resultPtr = _calculateSha1(pathPtr);
    final result = resultPtr.toDartString();

    _freeString(resultPtr);
    calloc.free(pathPtr);

    return result;
  }

  String executeLua(String script) {
    if (script.isEmpty) return "ERR: EMPTY_SCRIPT";
    final scriptPtr = script.toNativeUtf8();
    final resultPtr = _runLua(scriptPtr);
    final result = resultPtr.toDartString();

    _freeString(resultPtr);
    calloc.free(scriptPtr);

    return result;
  }
}
