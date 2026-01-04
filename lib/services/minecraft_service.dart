import 'dart:convert';
import 'package:http/http.dart' as http;

class MinecraftVersion {
  final String id;
  final String type;
  final String url;
  final DateTime releaseTime;

  MinecraftVersion({
    required this.id,
    required this.type,
    required this.url,
    required this.releaseTime,
  });

  factory MinecraftVersion.fromJson(Map<String, dynamic> json) {
    return MinecraftVersion(
      id: json['id'],
      type: json['type'],
      url: json['url'],
      releaseTime: DateTime.parse(json['releaseTime']),
    );
  }
}

class MinecraftService {
  static const String manifestUrl =
      'https://launchermeta.mojang.com/mc/game/version_manifest.json';

  Future<List<MinecraftVersion>> getVersions() async {
    final response = await http.get(Uri.parse(manifestUrl));
    if (response.statusCode == 200) {
      final Map<String, dynamic> data = json.decode(response.body);
      final List versions = data['versions'];
      return versions.map((v) => MinecraftVersion.fromJson(v)).toList();
    } else {
      throw Exception('Failed to load version manifest');
    }
  }

  Future<Map<String, dynamic>> getVersionDetails(String url) async {
    final response = await http.get(Uri.parse(url));
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to load version details');
    }
  }
}
