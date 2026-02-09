import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'log_service.dart';
import 'package:path_provider/path_provider.dart';
import 'supabase_service.dart';

enum AuthType { guest, crystal, microsoft, none }

class UserSession {
  final String id;
  final String username;
  final String? skinUrl;
  final AuthType type;
  final String? accessToken;
  final String? refreshToken;
  final String? uuid; // Added for Minecraft launch
  final String? role; // Direct role (if primary auth provides it)
  final String? linkedCrystalRole;
  final String? linkedCrystalEmail;
  final String? linkedCrystalAvatar;
  final String? adminToken; // Elevated token from 2FA

  UserSession({
    required this.id,
    required this.username,
    required this.type,
    this.skinUrl,
    this.accessToken,
    this.refreshToken,
    this.uuid,
    this.role,
    this.linkedCrystalRole,
    this.linkedCrystalEmail,
    this.linkedCrystalAvatar,
    this.adminToken,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'username': username,
    'skinUrl': skinUrl,
    'type': type.toString(),
    'accessToken': accessToken,
    'refreshToken': refreshToken,
    'uuid': uuid,
    'role': role,
    'linkedCrystalRole': linkedCrystalRole,
    'linkedCrystalEmail': linkedCrystalEmail,
    'linkedCrystalAvatar': linkedCrystalAvatar,
    'adminToken': adminToken,
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
      refreshToken: json['refreshToken'],
      uuid: json['uuid'],
      role: json['role'],
      linkedCrystalRole: json['linkedCrystalRole'],
      linkedCrystalEmail: json['linkedCrystalEmail'],
      linkedCrystalAvatar: json['linkedCrystalAvatar'],
      adminToken: json['adminToken'],
    );
  }

  String? get effectiveRole => role ?? linkedCrystalRole;

  bool get isAdmin {
    if (adminToken != null) return true; // Explicit elevation
    
    final r = effectiveRole;
    if (r == null) return false;
    final adminRoles = [
      'admin',
      'neroferno',
      'killu',
      'killuwu',
      'developer',
      'staff',
    ];
    return adminRoles.contains(r.toLowerCase());
  }

  bool get isStaff {
    final r = effectiveRole;
    if (r == null) return false;
    if (isAdmin) return true;
    final staffRoles = ['moderator', 'mod', 'helper'];
    return staffRoles.contains(r.toLowerCase());
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
        logService.log("Session Check: Supabase user is null but valid session on disk found.", category: "AUTH");
        // Try to recover session using refreshToken if available
        if (_currentSession?.refreshToken != null) {
          logService.log("Session Check: Attempting recovery with refresh token...", category: "AUTH");
          try {
            final response = await SupabaseService().client.auth.setSession(_currentSession!.refreshToken!);
            logService.log("Session Check: Recovery successful!", category: "AUTH");
            
            // CRITICAL: Update _currentSession with the new refreshed session data
            // The previous _currentSession has the OLD accessToken (expired)
            final user = response.user;
            if (user != null && response.session != null) {
               final role = user.appMetadata['role'] ?? user.userMetadata?['role'];
               // We keep the ID and basic info, but update auth tokens and role
               _currentSession = UserSession(
                  id: _currentSession!.id,
                  username: _currentSession!.username, // Keep username
                  type: _currentSession!.type, 
                  accessToken: response.session!.accessToken, // NEW Token
                  refreshToken: response.session!.refreshToken, // NEW Refresh Token
                  uuid: _currentSession!.uuid,
                  skinUrl: _currentSession!.skinUrl,
                  role: role?.toString(), // Refresh role
                  linkedCrystalRole: _currentSession!.linkedCrystalRole,
                  linkedCrystalEmail: _currentSession!.linkedCrystalEmail,
                  linkedCrystalAvatar: _currentSession!.linkedCrystalAvatar,
               );
               await _saveSessionToDisk();
               notifyListeners();
            }
            return; // Session restored, no need to logout
          } catch (e) {
            logService.log("Session Check: Recovery failed: $e", level: Level.warning, category: "AUTH");
          }
        }
        
        // Session expired or invalid and recovery failed
        logService.log("Session Check: Logging out due to invalid session.", category: "AUTH");
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

        final role = user.appMetadata['role'] ?? user.userMetadata?['role'];
        final avatarUrl =
            user.userMetadata?['avatar_url'] ?? user.userMetadata?['picture'];

        _currentSession = UserSession(
          id: user.id,
          username: username,
          type: AuthType.crystal,
          accessToken: response.session?.accessToken,
          refreshToken: response.session?.refreshToken,
          skinUrl:
              avatarUrl, // Use avatar as skinUrl for primary crystal session
          uuid: user.id,
          role: role?.toString(),
        );
        await _saveSessionToDisk();
        notifyListeners();
      }
    } catch (e) {
      rethrow;
    }
  }

  Future<void> linkCrystal(String email, String password) async {
    final current = _currentSession;
    if (current == null) {
      throw "No hay una sesión activa para vincular.";
    }

    try {
      final response = await SupabaseService().signIn(email, password);
      final user = response.user;

      if (user != null) {
        final role = user.appMetadata['role'] ?? user.userMetadata?['role'];
        final avatarUrl =
            user.userMetadata?['avatar_url'] ?? user.userMetadata?['picture'];

        _currentSession = UserSession(
          id: current.id,
          username: current.username,
          type: current.type,
          accessToken: current.accessToken,
          refreshToken: current.refreshToken,
          uuid: current.uuid,
          skinUrl: current.skinUrl,
          role: current.role,
          linkedCrystalRole: role?.toString(),
          linkedCrystalEmail: email,
          linkedCrystalAvatar: avatarUrl,
        );

        await _saveSessionToDisk();
        notifyListeners();
      }
    } catch (e) {
      logService.log("Error vinculando cuenta Crystal", error: e, level: Level.error, category: "AUTH");
      rethrow;
    }
  }

  Future<void> elevateSession(String adminToken, {String? role}) async {
    final current = _currentSession;
    if (current == null) return;

    _currentSession = UserSession(
      id: current.id,
      username: current.username,
      type: current.type,
      accessToken: current.accessToken,
      refreshToken: current.refreshToken,
      uuid: current.uuid,
      skinUrl: current.skinUrl,
      role: role ?? current.role, // Update role if provided
      linkedCrystalRole: current.linkedCrystalRole,
      linkedCrystalEmail: current.linkedCrystalEmail,
      linkedCrystalAvatar: current.linkedCrystalAvatar,
      adminToken: adminToken,
    );

    await _saveSessionToDisk();
    notifyListeners();
  }

  Future<void> logout() async {
    // Only sign out from Supabase if we were using it as primary or it was linked
    if (_currentSession?.type == AuthType.crystal ||
        _currentSession?.linkedCrystalEmail != null) {
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
      logService.log("Error saving session", error: e, level: Level.error, category: "STORAGE");
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
      logService.log("Error loading session", error: e, level: Level.error, category: "STORAGE");
    }
  }

  /// Resolves the final direct PNG URL for a user's skin.
  /// Handles UUIDs, Mojang API, and fallbacks.
  Future<String> getSkinTextureUrl() async {
    final session = _currentSession;
    if (session == null) return 'https://mc-heads.net/skin/steve';

    // If we already have a direct textures.minecraft.net, mc-heads.net or Base64 data
    if (session.skinUrl != null && 
        (session.skinUrl!.contains('textures.minecraft.net') || 
         session.skinUrl!.contains('mc-heads.net') ||
         session.skinUrl!.startsWith('data:image'))) {
      return session.skinUrl!;
    }

    // For Microsoft/Mojang sessions, attempt to fetch the texture from their API
    if (session.type == AuthType.microsoft && session.uuid != null) {
      try {
        // We use mc-heads as a robust proxy that does the decoding for us
        // It's much cleaner than doing base64 decoding in Dart for a simple UI element
        return 'https://mc-heads.net/skin/${session.uuid}';
      } catch (e) {
        logService.log("Error resolving Mojang skin", error: e, level: Level.error, category: "NETWORK");
      }
    }

    // Default fallbacks
    if (session.username.isNotEmpty) {
      return 'https://mc-heads.net/skin/${session.username}';
    }

    return 'https://mc-heads.net/skin/steve';
  }
}
