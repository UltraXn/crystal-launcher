import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'log_service.dart';
// import 'package:logger/logger.dart' show Level; -- Exported by log_service.dart

class SupabaseService {
  static final SupabaseService _instance = SupabaseService._internal();

  factory SupabaseService() => _instance;

  SupabaseService._internal();

  SupabaseClient get client {
    if (!_isInitialized) {
      throw Exception(
        'SupabaseService no está inicializado. '
        'Verifica que el archivo .env exista y contenga SUPABASE_URL y SUPABASE_ANON_KEY.',
      );
    }
    return Supabase.instance.client;
  }

  bool _isInitialized = false;
  bool get isInitialized => _isInitialized;

  Future<void> initialize() async {
    String? supabaseUrl;
    String? supabaseKey;
    
    try {
      supabaseUrl = dotenv.maybeGet('SUPABASE_URL');
      supabaseKey = dotenv.maybeGet('SUPABASE_ANON_KEY');
    } catch (_) {
      logService.log('⚠️ DotEnv not initialized or accessible', level: Level.warning, category: 'NETWORK');
    }

    if (supabaseUrl == null || supabaseKey == null) {
      logService.log('⛔ Supabase Env Error: Missing URL or Key', level: Level.error, category: 'NETWORK');
      return;
    }

    try {
      await Supabase.initialize(
        url: supabaseUrl,
        anonKey: supabaseKey,
        debug: true, // Enabled for debugging authentication issues
      );
      _isInitialized = true;
      logService.log('✅ Supabase Initialized', category: 'NETWORK');
    } catch (e) {
      logService.log('⛔ Supabase Init Error', error: e, level: Level.error, category: 'NETWORK');
    }
  }

  // Auth wrap with enhanced error logging
  Future<AuthResponse> signIn(String email, String password) async {
    try {
      return await client.auth.signInWithPassword(
        email: email,
        password: password,
      );
    } catch (e) {
      logService.log("Error durante inicio de sesión", error: e, level: Level.error, category: "AUTH");
      if (e is AuthException) {
         logService.log("Supabase Auth Error: ${e.message} (Code: ${e.code}, Status: ${e.statusCode})", level: Level.error, category: "AUTH");
      }
      rethrow;
    }
  }

  Future<AuthResponse> signUp(
    String email,
    String password,
    String username,
  ) async {
    return await client.auth.signUp(
      email: email,
      password: password,
      data: {'username': username},
    );
  }

  Future<void> signOut() async {
    await client.auth.signOut();
  }

  User? get currentUser => _isInitialized ? client.auth.currentUser : null;

  Stream<AuthState> get authStateChanges =>
      _isInitialized ? client.auth.onAuthStateChange : const Stream.empty();
}
