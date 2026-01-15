import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'supabase_service.dart';

enum AuthType { guest, crystal, microsoft, none }

class UserSession {
  final String id;
  final String username;
  final String? skinUrl;
  final AuthType type;
  final String? accessToken;
  final String? uuid; // Added for Minecraft launch

  UserSession({
    required this.id,
    required this.username,
    required this.type,
    this.skinUrl,
    this.accessToken,
    this.uuid,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'username': username,
    'skinUrl': skinUrl,
    'type': type.toString(),
    'accessToken': accessToken,
    'uuid': uuid,
  };

  factory UserSession.fromJson(Map<String, dynamic> json) {
    return UserSession(
      id: json['id'],
      username: json['username'],
      skinUrl: json['skinUrl'],
      type: AuthType.values.firstWhere(
        (e) => e.toString() == json['type'],
        orElse: () => AuthType.none,
      ),
      accessToken: json['accessToken'],
      uuid: json['uuid'],
    );
  }
}

class SessionService extends ChangeNotifier {
  static final SessionService _instance = SessionService._internal();
  factory SessionService() => _instance;
  SessionService._internal();

  UserSession? _currentSession;
  UserSession? get currentSession => _currentSession;

  bool get isLoggedIn =>
      _currentSession != null && _currentSession!.type != AuthType.none;

  Future<void> initialize() async {
    await _loadSessionFromDisk();

    // Validate Supabase Session if type is Crystal
    if (_currentSession?.type == AuthType.crystal) {
      final supabaseUser = SupabaseService().currentUser;
      if (supabaseUser == null) {
        // Session expired or invalid
        await logout();
      }
    }
  }

  Future<void> loginGuest(String nickname) async {
    _currentSession = UserSession(
      id: 'guest_${DateTime.now().millisecondsSinceEpoch}',
      username: nickname,
      type: AuthType.guest,
      skinUrl: null, // Default skin
    );
    await _saveSessionToDisk();
    notifyListeners();
  }

  Future<void> loginCrystal(String email, String password) async {
    try {
      final response = await SupabaseService().signIn(email, password);
      final user = response.user;

      if (user != null) {
        // In a real app, we would fetch the profile here to get the real username/skin
        // For now, we use the email or metadata
        final username = user.userMetadata?['username'] ?? email.split('@')[0];

        _currentSession = UserSession(
          id: user.id,
          username: username, // Fallback to part of email
          type: AuthType.crystal,
          accessToken: response.session?.accessToken,
          skinUrl: user.userMetadata?['skin_url'],
          uuid: user.id, // Using Supabase ID as UUID for now
        );
        await _saveSessionToDisk();
        notifyListeners();
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<void> logout() async {
    if (_currentSession?.type == AuthType.crystal) {
      await SupabaseService().signOut();
    }
    _currentSession = null;
    await _saveSessionToDisk();
    notifyListeners();
  }

  // Disk I/O using path_provider directly (No SharedPrefs plugin needed)
  Future<void> _saveSessionToDisk() async {
    try {
      final dir = await getApplicationDocumentsDirectory();
      final file = File('${dir.path}/launcher_session.json');
      if (_currentSession == null) {
        if (await file.exists()) await file.delete();
      } else {
        await file.writeAsString(jsonEncode(_currentSession!.toJson()));
      }
    } catch (e) {
      debugPrint("Error saving session: $e");
    }
  }

  Future<void> _loadSessionFromDisk() async {
    try {
      final dir = await getApplicationDocumentsDirectory();
      final file = File('${dir.path}/launcher_session.json');
      if (await file.exists()) {
        final content = await file.readAsString();
        _currentSession = UserSession.fromJson(jsonDecode(content));
        notifyListeners();
      }
    } catch (e) {
      debugPrint("Error loading session: $e");
    }
  }
}
