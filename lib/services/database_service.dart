import 'package:drift/drift.dart';
import '../data/local_database.dart';
import 'log_service.dart';

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
    logService.log("Opening database connection...", category: "STORAGE");
    _db = LocalDatabase();
    // Warm up connection
    logService.log("Warming up database connection (querying settings)...", category: "STORAGE");
    await _db!.select(_db!.settings).get();
    logService.log("Database connection warmed up", category: "STORAGE");
    await initDefaultKeybindings();
    logService.log("Default keybindings initialized", category: "STORAGE");
  }

  // Settings API
  Future<Setting> getSettings() => db.getSettings();

  Future<void> updateSettings(SettingsCompanion companion) =>
      db.updateSettings(companion);

  // Keybindings API
  Future<List<Keybinding>> getAllKeybindings() =>
      db.select(db.keybindings).get();

  Future<void> updateKeybinding(KeybindingsCompanion companion) async {
    await (db.update(db.keybindings)
          ..where((tbl) => tbl.action.equals(companion.action.value)))
        .write(companion);
  }

  // Profiles API
  Future<List<Profile>> getProfiles() => db.select(db.profiles).get();

  Future<Profile?> getProfile(int id) => (db.select(
    db.profiles,
  )..where((tbl) => tbl.id.equals(id))).getSingleOrNull();

  Future<int> createProfile(ProfilesCompanion companion) =>
      db.into(db.profiles).insert(companion);

  Future<void> updateProfile(ProfilesCompanion companion) =>
      db.update(db.profiles).replace(companion);

  Future<void> deleteProfile(int id) =>
      (db.delete(db.profiles)..where((tbl) => tbl.id.equals(id))).go();

  Future<void> initDefaultKeybindings() async {
    final existing = await getAllKeybindings();
    if (existing.isEmpty) {
      await db.batch((batch) {
        batch.insertAll(db.keybindings, [
          const KeybindingsCompanion(
            action: Value('launch_game'),
            keyString: Value('F5'),
          ),
          const KeybindingsCompanion(
            action: Value('open_mods'),
            keyString: Value('Ctrl+M'),
          ),
          const KeybindingsCompanion(
            action: Value('open_settings'),
            keyString: Value('Ctrl+S'),
          ),
        ]);
      });
    }
  }
}
