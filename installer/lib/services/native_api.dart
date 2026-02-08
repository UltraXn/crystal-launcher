import 'dart:ffi';
import 'dart:io';
import 'package:ffi/ffi.dart';

typedef InstallPayloadC = Int32 Function(Pointer<Uint8>, IntPtr, Pointer<Utf8>);
typedef InstallPayloadDart = int Function(Pointer<Uint8>, int, Pointer<Utf8>);

typedef CreateShortcutC = Int32 Function(Pointer<Utf8>, Pointer<Utf8>);
typedef CreateShortcutDart = int Function(Pointer<Utf8>, Pointer<Utf8>);

class NativeInstaller {
  late DynamicLibrary _lib;
  late InstallPayloadDart _installPayload;
  late CreateShortcutDart _createShortcut;

  NativeInstaller() {
    // Determine DLL path (next to executable or in build folder)
    var libraryPath = 'installer_native.dll';
    if (Platform.isWindows) {
      // In development
      // libraryPath = p.join(Directory.current.path, 'native', 'target', 'release', 'installer_native.dll');
    }
    
    try {
      _lib = DynamicLibrary.open(libraryPath);
    } catch (e) {
      // Fallback for dev environment or different structure
       _lib = DynamicLibrary.process(); // Or handle error
    }

    _installPayload = _lib
        .lookup<NativeFunction<InstallPayloadC>>('install_payload_ffi')
        .asFunction();

    _createShortcut = _lib
        .lookup<NativeFunction<CreateShortcutC>>('create_shortcut_ffi')
        .asFunction();
  }

  Future<void> installPayload(List<int> bytes, String path) async {
    final pointer = calloc<Uint8>(bytes.length);
    final list = pointer.asTypedList(bytes.length);
    list.setAll(0, bytes);

    final pathPtr = path.toNativeUtf8();

    final result = _installPayload(pointer, bytes.length, pathPtr);

    calloc.free(pointer);
    calloc.free(pathPtr);

    if (result != 0) {
      throw Exception("Rust Installation Failed (Code $result)");
    }
  }

  Future<void> createShortcut(String installPath, String appName) async {
    final pathPtr = installPath.toNativeUtf8();
    final namePtr = appName.toNativeUtf8();

    final result = _createShortcut(pathPtr, namePtr);

    calloc.free(pathPtr);
    calloc.free(namePtr);

    if (result != 0) {
       throw Exception("Rust Shortcut Creation Failed (Code $result)");
    }
  }
}
