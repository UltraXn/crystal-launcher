import 'dart:io';
import 'package:crypto/crypto.dart' as hash_pkg;

class HashUtils {
  /// Calcula el Fingerprint Murmur2 (CurseForge)
  /// ignora bytes específicos [9, 10, 13, 32] según estándar CurseForge
  static int calculateCurseForgeFingerprint(List<int> data) {
    final filtered = data.where((b) => b != 9 && b != 10 && b != 13 && b != 32).toList();
    return _murmur2(filtered, 1);
  }

  static Future<String> getFileHash(File file) async {
    if (!await file.exists()) return "";
    final bytes = await file.readAsBytes();
    return hash_pkg.sha1.convert(bytes).toString();
  }

  static int _murmur2(List<int> data, int seed) {
    const int m = 0x5bd1e995;
    const int r = 24;
    int h = (seed ^ data.length) & 0xffffffff;

    int i = 0;
    while (data.length - i >= 4) {
      int k = (data[i] & 0xff) |
          ((data[i + 1] & 0xff) << 8) |
          ((data[i + 2] & 0xff) << 16) |
          ((data[i + 3] & 0xff) << 24);

      k = (k * m) & 0xffffffff;
      k = (k ^ (k >>> r)) & 0xffffffff;
      k = (k * m) & 0xffffffff;

      h = (h * m) & 0xffffffff;
      h = (h ^ k) & 0xffffffff;
      i += 4;
    }

    int remaining = data.length - i;
    if (remaining == 3) {
      h = (h ^ ((data[i + 2] & 0xff) << 16)) & 0xffffffff;
      h = (h ^ ((data[i + 1] & 0xff) << 8)) & 0xffffffff;
      h = (h ^ (data[i] & 0xff)) & 0xffffffff;
      h = (h * m) & 0xffffffff;
    } else if (remaining == 2) {
      h = (h ^ ((data[i + 1] & 0xff) << 8)) & 0xffffffff;
      h = (h ^ (data[i] & 0xff)) & 0xffffffff;
      h = (h * m) & 0xffffffff;
    } else if (remaining == 1) {
      h = (h ^ (data[i] & 0xff)) & 0xffffffff;
      h = (h * m) & 0xffffffff;
    }

    h = (h ^ (h >>> 13)) & 0xffffffff;
    h = (h * m) & 0xffffffff;
    h = (h ^ (h >>> 15)) & 0xffffffff;

    return h;
  }
}
