import 'dart:io';
import 'package:path/path.dart' as p;
import '../utils/hash_utils.dart';
import 'supabase_service.dart';
import 'log_service.dart';
import 'native_r2_service.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AdminService {
  final LogService logService = LogService();
  final NativeR2Service _nativeR2 = NativeR2Service();
  
  final String bucketName = "ctlauncher";
  final String publicUrlBase = "https://mods.crystaltidessmp.net";
  final String r2Endpoint = "a532114ca6919da0a11158f44975727b.r2.cloudflarestorage.com";

  AdminService();

  /// Escanea una carpeta local en busca de mods y genera sus metadatos
  Future<List<Map<String, dynamic>>> scanLocalMods(String directoryPath) async {
    final dir = Directory(directoryPath);
    if (!await dir.exists()) return [];

    final List<Map<String, dynamic>> mods = [];
    final files = dir.listSync().whereType<File>().where((f) => f.path.endsWith('.jar'));

    for (var file in files) {
      final name = p.basename(file.path);
      final hash = await HashUtils.getFileHash(file);
      mods.add({
        'name': name,
        'path': file.path,
        'sha1': hash,
        'size': await file.length(),
      });
    }

    return mods;
  }

  /// Sube múltiples mods a Cloudflare R2 en paralelo usando Rust
  Future<void> uploadModsBatch(
    List<Map<String, dynamic>> mods,
    {Function(int, int, String)? onProgress}
  ) async {
    final filePaths = mods.map((m) => m['path'] as String).toList();
    
    logService.log("🚀 Iniciando subida paralela de ${filePaths.length} mods...", category: "ADMIN");
    
    await _nativeR2.uploadModsBatch(
      filePaths,
      dotenv.get('R2_ACCESS_KEY'),
      dotenv.get('R2_SECRET_KEY'),
      r2Endpoint,
      bucketName,
      maxConcurrent: 10,
      onProgress: onProgress,
    );
    
    logService.log("✅ Todos los mods subidos correctamente.", category: "ADMIN");
  }

  /// Sube un solo mod (método legacy para compatibilidad)
  Future<void> uploadMod(String filePath) async {
    await uploadModsBatch([{'path': filePath}]);
  }

  /// Actualiza la tabla official_mods en Supabase
  Future<void> publishMods(List<Map<String, dynamic>> mods) async {
    logService.log("📝 Actualizando base de datos en Supabase...", category: "ADMIN");

    final client = SupabaseService().client;

    // Primero limpiamos la tabla (o usamos upsert si queremos mantener historial)
    // Para simplificar, haremos un TRUNCATE-like delete y luego insert
    await client.from('official_mods').delete().neq('name', '');

    final List<Map<String, dynamic>> rows = mods.map((mod) => {
      'name': mod['name'],
      'version': '1.0',
      'sha1': mod['sha1'],
      'download_url': '$publicUrlBase/${Uri.encodeComponent(mod['name'])}',
    }).toList();

    await client.from('official_mods').insert(rows);
    
    logService.log("✨ Base de datos actualizada con ${rows.length} mods.", category: "ADMIN");
  }

  /// Método de compatibilidad para ModManagerPage
  Future<void> processAdminModImport(File file, {required Function(String) onStatusUpdate}) async {
    final name = p.basename(file.path);
    onStatusUpdate("Hasheando $name...");
    final hash = await HashUtils.getFileHash(file);
    
    onStatusUpdate("Subiendo $name a R2...");
    await uploadMod(file.path);
    
    onStatusUpdate("Publicando $name en base de datos...");
    // Para simplificar el import individual, podríamos hacer un upsert
    final client = SupabaseService().client;
    await client.from('official_mods').upsert({
      'name': name,
      'version': '1.0',
      'sha1': hash,
      'download_url': '$publicUrlBase/${Uri.encodeComponent(name)}',
    });
    
    onStatusUpdate("✅ $name listo.");
  }
}
