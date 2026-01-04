import 'dart:io';
import 'package:dio/dio.dart';

class DownloadService {
  final Dio _dio = Dio();

  Future<void> downloadFile(
    String url,
    String savePath, {
    void Function(int received, int total)? onProgress,
  }) async {
    final file = File(savePath);
    if (!await file.parent.exists()) {
      await file.parent.create(recursive: true);
    }

    try {
      await _dio.download(
        url,
        savePath,
        onReceiveProgress: (received, total) {
          if (total != -1 && onProgress != null) {
            onProgress(received, total);
          }
        },
      );
    } catch (e) {
      throw Exception('Failed to download file: $e');
    }
  }
}
