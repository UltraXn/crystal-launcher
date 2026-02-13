import 'dart:io';
import 'package:file_picker/file_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'supabase_service.dart';
import 'log_service.dart';

class ProfileService {
  static final ProfileService _instance = ProfileService._internal();
  factory ProfileService() => _instance;
  ProfileService._internal();

  SupabaseClient get _client => SupabaseService().client;

  Future<String?> pickAndUploadAvatar() async {
    try {
      final user = SupabaseService().currentUser;
      if (user == null) {
        logService.log("⚠️ Intento de subir avatar sin sesión iniciada", level: Level.warning, category: "AUTH");
        throw Exception("Debes iniciar sesión para cambiar tu foto de perfil.");
      }

      logService.log("📂 Abriendo selector de archivos para avatar", category: "SYSTEM");
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.image,
        allowMultiple: false,
      );

      if (result == null || result.files.single.path == null) {
        logService.log("ℹ️ Selección de avatar cancelada", category: "SYSTEM");
        return null;
      }

      final file = File(result.files.single.path!);
      final fileExt = result.files.single.extension ?? 'jpg';
      final fileName = 'avatar_${DateTime.now().millisecondsSinceEpoch}.$fileExt';
      // Según la política RLS: (auth.uid())::text = (storage.foldername(name))[1]
      // El archivo debe estar en una carpeta con el UID del usuario.
      final filePath = '${user.id}/$fileName';

      logService.log("🚀 Subiendo nuevo avatar: $filePath", category: "NETWORK");

      await _client.storage.from('avatars').upload(
        filePath,
        file,
        fileOptions: const FileOptions(cacheControl: '3600', upsert: true),
      );

      final String publicUrl = _client.storage.from('avatars').getPublicUrl(filePath);

      logService.log("✅ Avatar subido a Storage, actualizando perfil...", category: "NETWORK");

      await _client.from('profiles').update({
        'avatar_url': publicUrl,
      }).eq('id', user.id);

      logService.log("✨ Perfil actualizado con éxito", category: "NETWORK");
      return publicUrl;
    } catch (e) {
      logService.log("❌ Error al actualizar el avatar", level: Level.error, error: e, category: "NETWORK");
      rethrow;
    }
  }
}
