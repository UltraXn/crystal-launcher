import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter/foundation.dart';
import 'log_service.dart';

class TwoFactorService {
  final String _baseUrl = dotenv.env['API_URL'] ?? 'http://localhost:3000';

  Future<bool> checkStatus(String token) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/auth/2fa/status'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      logService.log("2FA Check Status: ${response.statusCode}");
      logService.log("2FA Check Body: ${response.body}");

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        if (body['success'] == true && body['data'] != null) {
          return body['data']['enabled'] == true;
        }
      }
      return false;
    } catch (e) {
      logService.log("Error checking 2FA status", error: e, level: Level.error);
      return false;
    }
  }

  Future<String?> verify(String token, String code) async {
    try {
      logService.log("2FA Verify Request: $_baseUrl/auth/2fa/verify");
      debugPrint("2FA DEBUG: Verify Request: $_baseUrl/auth/2fa/verify");
      
      final response = await http.post(
        Uri.parse('$_baseUrl/auth/2fa/verify'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({'token': code}),
      );

      logService.log("2FA Verify Response Code: ${response.statusCode}");
      debugPrint("2FA DEBUG: Verify Response Code: ${response.statusCode}");
      logService.log("2FA Verify Response Body: ${response.body}");
      debugPrint("2FA DEBUG: Verify Response Body: ${response.body}");

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        if (body['success'] == true && body['data'] != null) {
           return body['data']['adminToken'];
        }
      }
      return null;
    } catch (e) {
      logService.log("Error verifying 2FA", error: e, level: Level.error);
      return null;
    }
  }
}
