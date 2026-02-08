import '../utils/logger.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class SupabaseService {
  static final SupabaseService _instance = SupabaseService._internal();

  factory SupabaseService() => _instance;

  SupabaseService._internal();

  SupabaseClient get client => Supabase.instance.client;

  bool _isInitialized = false;
  bool get isInitialized => _isInitialized;

  Future<void> initialize() async {
    final supabaseUrl = dotenv.env['SUPABASE_URL'] ?? 'https://gyoqnqvqhuxlcbrvtfia.supabase.co';
    final supabaseKey = dotenv.env['SUPABASE_ANON_KEY'] ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5b3FucXZxaHV4bGNicnZ0ZmlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyOTk0MTEsImV4cCI6MjA4MDg3NTQxMX0.eLU_-IrRfixx7dpR9jeiEoOT1u-exQMhIsxSXVINbRA';

    try {
      await Supabase.initialize(
        url: supabaseUrl,
        anonKey: supabaseKey,
        debug: false,
      );
      _isInitialized = true;
      logger.i('✅ Supabase Initialized');
    } catch (e) {
      logger.e('⛔ Supabase Init Error', error: e);
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
