import 'dart:io';
import 'package:path/path.dart' as p;
import 'native_api.dart';
import 'supabase_service.dart';
import '../utils/logger.dart';

class AdminService {
  static final AdminService _instance = AdminService._internal();
  factory AdminService() => _instance;
  AdminService._internal();

  final String _repo = "UltraXn/CrystalTides-Assets";
  final String _tag = "mods-v1";

  /// Orquestra el proceso completo: Hash -> Upload -> Registro DB
  Future<void> processAdminModImport(File file, {Function(String)? onStatusUpdate}) async {
    final fileName = p.basename(file.path);
    
    try {
      // 1. Calcular Hash SHA1
      onStatusUpdate?.call("Calculando hash...");
      final hash = await NativeApi().calculateFileHash(file.path);
      if (hash == null) throw Exception("Error al calcular el hash del archivo.");
      logger.i("Hash calculado para $fileName: $hash");

      // 2. Subir a GitHub
      onStatusUpdate?.call("Subiendo a GitHub...");
      await _uploadToGitHub(file);
      logger.i("Archivo subido a GitHub: $fileName");

      // 3. Registrar en Supabase
      onStatusUpdate?.call("Registrando en base de datos...");
      final downloadUrl = "https://github.com/$_repo/releases/download/$_tag/$fileName";
      await _registerInSupabase(fileName, hash, downloadUrl);
      logger.i("Mod registrado en Supabase: $fileName");

      onStatusUpdate?.call("Importación completada con éxito.");
    } catch (e) {
      logger.e("Error en processAdminModImport para $fileName", error: e);
      rethrow;
    }
  }

  Future<void> _uploadToGitHub(File file) async {
    // Usamos el comando 'gh release upload' con --clobber para sobreescribir si ya existe
    final result = await Process.run(
      'gh',
      ['release', 'upload', _tag, file.path, '--repo', _repo, '--clobber'],
    );

    if (result.exitCode != 0) {
      throw Exception("Error de GitHub CLI (${result.exitCode}): ${result.stderr}");
    }
  }

  Future<void> _registerInSupabase(String name, String hash, String url) async {
    // Primero verificamos si ya existe para actualizar o insertar
    final existing = await SupabaseService().client
        .from('official_mods')
        .select()
        .eq('name', name)
        .maybeSingle();

    if (existing != null) {
      await SupabaseService().client.from('official_mods').update({
        'sha1': hash,
        'download_url': url,
        'version': '1.0', // Versión por defecto
      }).eq('name', name);
    } else {
      await SupabaseService().client.from('official_mods').insert({
        'name': name,
        'sha1': hash,
        'download_url': url,
        'version': '1.0',
      });
    }
  }
}
