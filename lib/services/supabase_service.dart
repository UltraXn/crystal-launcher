import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'log_service.dart';

class SupabaseService {
  static final SupabaseService _instance = SupabaseService._internal();

  factory SupabaseService() => _instance;

  SupabaseService._internal();

  SupabaseClient get client => Supabase.instance.client;

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
        debug: false,
      );
      _isInitialized = true;
      logService.log('✅ Supabase Initialized', category: 'NETWORK');
    } catch (e) {
      logService.log('⛔ Supabase Init Error', error: e, level: Level.error, category: 'NETWORK');
    }
  }

  // Auth Wrappers
  Future<AuthResponse> signIn(String email, String password) async {
    return await client.auth.signInWithPassword(
      email: email,
      password: password,
    );
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

  User? get currentUser => client.auth.currentUser;

  Stream<AuthState> get authStateChanges => client.auth.onAuthStateChange;
}
