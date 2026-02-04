class Mod {
  final String id;
  final String name;
  final String filename;
  final String hash;
  final String downloadUrl;
  final bool isRequired;
  final String? description;
  final String category; // 'performance', 'utility', 'magic', etc.

  // Estado local (no persistido en DB)
  bool isEnabled;

  Mod({
    required this.id,
    required this.name,
    required this.filename,
    required this.hash,
    required this.downloadUrl,
    required this.isRequired,
    this.description,
    this.category = 'misc',
    this.isEnabled = true,
  });

  factory Mod.fromJson(Map<String, dynamic> json) {
    return Mod(
      id: json['id'] ?? '',
      name: json['name'] ?? 'Unknown Mod',
      filename: json['filename'] ?? '',
      hash: json['hash'] ?? '',
      downloadUrl: json['download_url'] ?? '',
      isRequired: json['is_required'] ?? false,
      description: json['description'],
      category: json['category'] ?? 'misc',
    );
  }

  // Para convertir mods locales "desconocidos" en objetos Mod
  factory Mod.fromLocalFile(String filename, String path) {
    return Mod(
      id: 'local_$filename',
      name: filename,
      filename: filename,
      hash: '', // Se calcularía en tiempo de ejecución
      downloadUrl: '',
      isRequired: false,
      description: 'Mod instalado manualmente por el usuario',
      category: 'local',
    );
  }
}
