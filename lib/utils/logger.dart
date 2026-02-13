import 'package:logger/logger.dart';
import 'package:flutter/foundation.dart';
import '../services/log_service.dart';

// Este logger global ahora está integrado con LogService para persistencia.
final logger = Logger(
  printer: PrettyPrinter(
    methodCount: 0,
    errorMethodCount: 5,
    lineLength: 80,
    colors: true,
    printEmojis: true,
    dateTimeFormat: DateTimeFormat.onlyTimeAndSinceStart,
  ),
  output: _CrystalLogOutput(),
);

class _CrystalLogOutput extends LogOutput {
  static bool _isLogging = false;

  @override
  void output(OutputEvent event) {
    if (_isLogging) return;
    _isLogging = true;

    try {
      // Imprimir en consola (comportamiento por defecto)
      for (var line in event.lines) {
        debugPrint(line);
      }
      
      // Guardar en archivo persistente
      for (var line in event.lines) {
        logService.writeToFile(line);
      }
    } finally {
      _isLogging = false;
    }
  }
}
