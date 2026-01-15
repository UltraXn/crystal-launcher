class NewsPost {
  final String id;
  final String title;
  final String content;
  final String category;
  final String? imageUrl;
  final DateTime createdAt;

  NewsPost({
    required this.id,
    required this.title,
    required this.content,
    required this.category,
    this.imageUrl,
    required this.createdAt,
  });

  factory NewsPost.fromJson(Map<String, dynamic> json) {
    return NewsPost(
      id: json['id'] ?? '',
      title: json['title'] ?? 'Sin título',
      content: json['content'] ?? '',
      category: json['category'] ?? 'General',
      imageUrl:
          json['imageUrl'] ?? json['image_url'], // Support camel or snake case
      createdAt:
          DateTime.tryParse(json['createdAt'] ?? json['created_at'] ?? '') ??
          DateTime.now(),
    );
  }
}
