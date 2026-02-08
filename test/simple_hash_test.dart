import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:launcher/services/native_api.dart';

Future<void> main() async {
  debugPrint("Starting Native SHA1 Test...");
  
  // 1. Create temp file
  final tempDir = Directory.systemTemp.createTempSync('hash_test_simple');
  final tempFile = File('${tempDir.path}/test.txt');
  // Write exactly "hello world" as bytes to avoid newline/encoding issues
  await tempFile.writeAsBytes([104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100]); 
  debugPrint("Created temp file: ${tempFile.path}");

  try {
    debugPrint("Initializing NativeApi...");
    final api = NativeApi();
    
    debugPrint("Calculating hash...");
    final hash = await api.calculateFileHash(tempFile.absolute.path);
    
    debugPrint('Calculated Hash: $hash');
    debugPrint('Expected Hash:   2aae6c35c94fcfb415dbe95f408b9ce91ee846ed');
    
    if (hash == '2aae6c35c94fcfb415dbe95f408b9ce91ee846ed') {
        debugPrint("SUCCESS: Hash matches!");
        exit(0);
    } else {
        debugPrint("FAILURE: Hash mismatch!");
        exit(1);
    }
    
  } catch (e, st) {
    debugPrint("EXCEPTION: $e");
    debugPrint(st.toString());
    exit(2);
  } finally {
    // Cleanup
    if (tempDir.existsSync()) {
        tempDir.deleteSync(recursive: true);
    }
  }
}
