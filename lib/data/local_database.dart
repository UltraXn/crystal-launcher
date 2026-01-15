import 'dart:io';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'schema/settings.dart';

part 'local_database.g.dart';

@DriftDatabase(tables: [Settings])
class LocalDatabase extends _$LocalDatabase {
  LocalDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

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
