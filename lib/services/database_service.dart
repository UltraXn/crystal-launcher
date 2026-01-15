import '../data/local_database.dart';

class DatabaseService {
  static final DatabaseService _instance = DatabaseService._internal();

  factory DatabaseService() => _instance;

  DatabaseService._internal();

  LocalDatabase? _db;

  LocalDatabase get db {
    if (_db == null) throw Exception("Database not initialized");
    return _db!;
  }

  Future<void> initialize() async {
    _db = LocalDatabase();
    // Warm up connection
    await _db!.select(_db!.settings).get();
  }

  // Settings API
  Future<Setting> getSettings() => db.getSettings();

  Future<void> updateSettings(SettingsCompanion companion) =>
      db.updateSettings(companion);
}
