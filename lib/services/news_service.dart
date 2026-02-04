import 'dart:convert';
import '../utils/logger.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../models/news_post.dart';

class NewsService {
  static final String _baseUrl =
      dotenv.env['API_URL'] ?? 'http://localhost:3000/api';

  Future<List<NewsPost>> getNews({int limit = 5}) async {
    try {
      final response = await http.get(Uri.parse('$_baseUrl/news'));

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        // Assuming the API returns a list directly or { data: [] }
        // For now assuming list based on backend checks
        return data.map((json) => NewsPost.fromJson(json)).take(limit).toList();
      } else {
        logger.e('Failed to load news: ${response.statusCode}');
        return [];
      }
    } catch (e) {
      logger.e('Error fetching news', error: e);
      // Return dummy data for development if API fails
      return _getDummyData();
    }
  }

  List<NewsPost> _getDummyData() {
    return [
      NewsPost(
        id: '1',
        title: '¡Bienvenidos a CrystalTides!',
        content:
            'El servidor ha abierto sus puertas oficialmente. Únete ahora.',
        category: 'Anuncio',
        imageUrl:
            'https://images.unsplash.com/photo-1599508704512-2f19efd1e35f?q=80&w=1000',
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
      ),
      NewsPost(
        id: '2',
        title: 'Mantenimiento Programado',
        content:
            'Realizaremos mejoras en el lobby principal este fin de semana.',
        category: 'Mantenimiento',
        createdAt: DateTime.now().subtract(const Duration(days: 3)),
      ),
      NewsPost(
        id: '3',
        title: 'Nuevo Evento PvP',
        content: 'Prepárate para el torneo de gladiadores.',
        category: 'Evento',
        createdAt: DateTime.now().subtract(const Duration(days: 5)),
      ),
    ];
  }
}
