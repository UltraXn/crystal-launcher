import 'dart:io';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter/material.dart';
import '../../services/microsoft_auth_constants.dart';
import 'package:uuid/uuid.dart';
import 'package:drift/drift.dart' as drift;
import '../data/database.dart';
import 'package:url_launcher/url_launcher.dart'; // Added url_launcher

class AuthService {
  final AppDatabase _db;

  // Microsoft Device Code Flow (Public Client ID for Minecraft)
  // Using a standard one or one we'd register. For this POC we'll use a placeholder or known one.
  // Common public client ID for MC: 00000000-402b-453d-8e4a-1e60dc4d1820 (Live SDK) but requires more.
  // For simplicity/demo mode I'll implement a Mock-Microsoft flow and a Real Offline flow.

  AuthService(this._db);

  /// 1. Offline Login: Generates a consistent UUID from the username
  Future<AccountsCompanion> loginOffline(String username) async {
    final uuid =
        const Uuid().v5(Namespace.url.value, "OfflinePlayer:$username");

    final account = AccountsCompanion.insert(
      id: uuid,
      name: username,
      type: "offline",
      accessToken: const drift.Value(""),
      refreshToken: const drift.Value(""),
    );

    await _db.into(_db.accounts).insertOnConflictUpdate(account);
    await switchAccount(uuid); // Make active immediately
    return account;
  }

  // --- Microsoft Login (System Browser + Local Server) ---
  Future<void> loginMicrosoft(BuildContext context) async {
    debugPrint("🚀 Starting Microsoft Login (System Browser)...");
    HttpServer? server;

    try {
      // 1. Cancel previous login attempts if any (simple approach)

      // 2. Start Local Server on port 1338
      try {
        // Must bind to 127.0.0.1 specifically
        server = await HttpServer.bind(InternetAddress.loopbackIPv4, 1338);
      } catch (e) {
        throw "Port 1338 is busy. Please close other instances or apps using this port.";
      }
      debugPrint("🌐 Listening on http://127.0.0.1:1338");

      // 3. Launch Auth URL
      final authUrl = MicrosoftAuthConstants.authorizeUrl;
      debugPrint("🔗 Launching: $authUrl");

      final uri = Uri.parse(authUrl);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        throw "Could not launch browser";
      }

      // 4. Wait for Code
      String? authCode;
      await for (HttpRequest request in server) {
        final code = request.uri.queryParameters['code'];
        final error = request.uri.queryParameters['error'];

        if (code != null) {
          authCode = code;
          // Success Response
          request.response
            ..statusCode = HttpStatus.ok
            ..headers.contentType = ContentType.html
            ..write('''
              <html>
                <body style="background-color: #121212; color: #e0e0e0; font-family: sans-serif; text-align: center; display: flex; flex-direction: column; justify-content: center; height: 100vh; margin: 0;">
                  <h1 style="color: #4CAF50;">Login Successful! 🎉</h1>
                  <p>You can close this tab and return to the Launcher.</p>
                  <script>window.close();</script>
                </body>
              </html>
            ''');
          await request.response.close();
          break; // Stop listening
        } else if (error != null) {
          debugPrint("❌ Login Error Callback: $error");
          request.response
            ..statusCode = HttpStatus.badRequest
            ..headers.contentType = ContentType.html
            ..write(
                '<html><body><h1 style="color:red">Login Failed</h1><p>$error</p></body></html>');
          await request.response.close();
          // Don't break immediately, maybe user retries? Actually simpler to break.
          break;
        } else {
          // Ignore favicons, etc.
          request.response.statusCode = HttpStatus.notFound;
          await request.response.close();
        }
      }

      await server.close();
      server = null;

      if (authCode == null) {
        debugPrint("❌ Login Cancelled or No Code");
        return;
      }

      debugPrint("✅ Got Auth Code! Starting Token Exchange...");

      // 5. Exchange Code for Tokens (The Heavy Lifting)
      if (!context.mounted) return;

      // Show loading indicator usually, but we are in the main page context or triggered from button
      // We'll proceed with logged outputs.

      debugPrint("🔄 Exchanging code for Microsoft Token...");
      final msToken = await _exchangeMicrosoftToken(authCode);

      debugPrint("🔄 Authenticating with Xbox Live...");
      final xboxToken = await _authenticateXbox(msToken);

      debugPrint("🔄 Authorizing with XSTS...");
      final (xstsToken, userHash) = await _authorizeXsts(xboxToken);

      debugPrint("🔄 Logging into Minecraft...");
      final mcToken = await _loginMinecraft(xstsToken, userHash);

      debugPrint("🔄 Fetching Minecraft Profile...");
      final profile = await _fetchMinecraftProfile(mcToken);

      debugPrint("✅ Full Login Success: ${profile['name']}");

      // Save Account
      final account = AccountsCompanion.insert(
        id: profile['id'],
        name: profile['name'],
        type: "microsoft",
        accessToken: drift.Value(mcToken),
        refreshToken: const drift.Value(
            ""), // NOTE: Refresh token flow pending implementation
      );

      await _db.into(_db.accounts).insertOnConflictUpdate(account);
      await switchAccount(profile['id']);

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text("Welcome, ${profile['name']}!"),
              backgroundColor: Colors.green),
        );
      }
    } catch (e) {
      debugPrint("❌ Authentication Exception: $e");
      if (server != null) await server.close();
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text("Login Failed: $e"), backgroundColor: Colors.red),
        );
      }
    }
  }

  // --- Auth Chain Helpers ---

  Future<String> _exchangeMicrosoftToken(String code) async {
    final response = await http.post(
      Uri.parse(MicrosoftAuthConstants.tokenUrl),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: {
        'client_id': MicrosoftAuthConstants.clientId,
        'code': code,
        'grant_type': 'authorization_code',
        'redirect_uri': MicrosoftAuthConstants.redirectUri,
        'scope': MicrosoftAuthConstants.scope,
        // Public Clients don't need client_secret often, but if 'unauthorized_client' happens, check docs.
        // For Native Apps (Mobile/Desktop), secret is None.
      },
    );

    if (response.statusCode != 200) {
      throw "Microsoft Token Failed: ${response.body}";
    }
    return jsonDecode(response.body)['access_token'];
  }

  Future<String> _authenticateXbox(String msToken) async {
    final response = await http.post(
      Uri.parse("https://user.auth.xboxlive.com/user/authenticate"),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: jsonEncode({
        "Properties": {
          "AuthMethod": "RPS",
          "SiteName": "user.auth.xboxlive.com",
          "RpsTicket": "d=$msToken"
        },
        "RelyingParty": "http://auth.xboxlive.com",
        "TokenType": "JWT"
      }),
    );

    if (response.statusCode != 200) throw "Xbox Auth Failed: ${response.body}";
    return jsonDecode(response.body)['Token'];
  }

  Future<(String, String)> _authorizeXsts(String xboxToken) async {
    final response = await http.post(
      Uri.parse("https://xsts.auth.xboxlive.com/xsts/authorize"),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: jsonEncode({
        "Properties": {
          "SandboxId": "RETAIL",
          "UserTokens": [xboxToken]
        },
        "RelyingParty": "rp://api.minecraftservices.com/",
        "TokenType": "JWT"
      }),
    );

    if (response.statusCode != 200) throw "XSTS Auth Failed: ${response.body}";
    final data = jsonDecode(response.body);
    return (
      data['Token'] as String,
      data['DisplayClaims']['xui'][0]['uhs'] as String
    );
  }

  Future<String> _loginMinecraft(String xstsToken, String userHash) async {
    final response = await http.post(
      Uri.parse(
          "https://api.minecraftservices.com/authentication/login_with_xbox"),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({"identityToken": "XBL3.0 x=$userHash;$xstsToken"}),
    );

    if (response.statusCode != 200) {
      throw "Minecraft Login Failed: ${response.body}";
    }
    return jsonDecode(response.body)['access_token'];
  }

  Future<Map<String, dynamic>> _fetchMinecraftProfile(String mcToken) async {
    final response = await http.get(
      Uri.parse("https://api.minecraftservices.com/minecraft/profile"),
      headers: {'Authorization': 'Bearer $mcToken'},
    );

    if (response.statusCode != 200) {
      throw "Profile Fetch Failed: ${response.body}";
    }
    return jsonDecode(response.body);
  }

  Future<List<Account>> getAccounts() async {
    return _db.select(_db.accounts).get();
  }

  Future<Account?> getActiveAccount() async {
    final activeId = await _db.getSetting('active_account_id');
    if (activeId == null) {
      // Fallback to first account if available
      final accounts = await getAccounts();
      if (accounts.isNotEmpty) {
        await switchAccount(accounts.first.id);
        return accounts.first;
      }
      return null;
    }

    return (_db.select(_db.accounts)..where((t) => t.id.equals(activeId)))
        .getSingleOrNull();
  }

  Future<void> switchAccount(String accountId) async {
    await _db.updateSetting('active_account_id', accountId);
  }

  Future<void> logout(String accountId) async {
    await (_db.delete(_db.accounts)..where((t) => t.id.equals(accountId))).go();

    final activeId = await _db.getSetting('active_account_id');
    if (activeId == accountId) {
      // If we logged out the active user, try to switch to another one or clear
      final remaining = await getAccounts();
      if (remaining.isNotEmpty) {
        await switchAccount(remaining.first.id);
      } else {
        await _db.updateSetting('active_account_id', '');
      }
    }
  }

  Stream<Account?> watchActiveAccount() {
    return (_db.select(_db.launcherSettings)
          ..where((t) => t.key.equals('active_account_id')))
        .watchSingleOrNull()
        .asyncMap((setting) async {
      if (setting == null || setting.value.isEmpty) return null;

      final activeId = setting.value;
      return (_db.select(_db.accounts)..where((t) => t.id.equals(activeId)))
          .getSingleOrNull();
    });
  }
}
