import 'dart:io';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'schema/settings.dart';
import 'schema/profiles.dart';
import 'schema/keybindings.dart';

part 'local_database.g.dart';

@DriftDatabase(tables: [Settings, Keybindings, Profiles])
class LocalDatabase extends _$LocalDatabase {
  LocalDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 3;

  @override
  MigrationStrategy get migration => MigrationStrategy(
    onCreate: (m) => m.createAll(),
    onUpgrade: (m, from, to) async {
      if (from < 2) {
        // Add new columns to settings
        await m.addColumn(settings, settings.mcVersion);
        await m.addColumn(settings, settings.neoForgeVersion);
        await m.addColumn(settings, settings.autoConnect);
        // Create new table
        await m.createTable(keybindings);
      }
      if (from < 3) {
        await m.createTable(profiles);
        await m.addColumn(settings, settings.selectedProfileId);
      }
    },
  );

  // Single default settings getter/creator
  Future<Setting> getSettings() async {
    final query = select(settings)..limit(1);
    final result = await query.getSingleOrNull();
    if (result == null) {
      // Create default
      final id = await into(settings).insert(const SettingsCompanion());
      return await (select(
        settings,
      )..where((tbl) => tbl.id.equals(id))).getSingle();
    }
    return result;
  }

  Future<void> updateSettings(SettingsCompanion companion) async {
    // Always update first row
    await (update(settings)..where((tbl) => tbl.id.equals(1))).write(companion);
  }
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'launcher_db.sqlite'));
    return NativeDatabase.createInBackground(file);
  });
}
