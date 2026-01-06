import 'dart:io';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

part 'database.g.dart';

class LauncherSettings extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get key => text().unique()();
  TextColumn get value => text()();
}

class Accounts extends Table {
  TextColumn get id => text()(); // UUID
  TextColumn get name => text()();
  TextColumn get type => text()(); // 'microsoft', 'offline'
  TextColumn get accessToken => text().nullable()();
  TextColumn get refreshToken => text().nullable()();
  DateTimeColumn get expiresAt => dateTime().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

class Profiles extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get name => text()();
  TextColumn get versionId => text()();
  TextColumn get type => text()(); // 'vanilla', 'fabric', 'forge'
  TextColumn get icon => text().nullable()();
  DateTimeColumn get lastPlayed => dateTime().nullable()();
}

@DriftDatabase(tables: [LauncherSettings, Accounts, Profiles])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 3;

  @override
  MigrationStrategy get migration {
    return MigrationStrategy(
      onCreate: (Migrator m) async {
        await m.createAll();
      },
      onUpgrade: (Migrator m, int from, int to) async {
        if (from < 2) {
          await m.createTable(accounts);
        }
        if (from < 3) {
          await m.createTable(profiles);
        }
      },
    );
  }

  Future<String?> getSetting(String key) async {
    final row = await (select(launcherSettings)
          ..where((t) => t.key.equals(key)))
        .getSingleOrNull();
    return row?.value;
  }

  Future<void> updateSetting(String key, String value) async {
    final exists = await (select(launcherSettings)
          ..where((t) => t.key.equals(key)))
        .getSingleOrNull();

    if (exists != null) {
      await (update(launcherSettings)..where((t) => t.key.equals(key))).write(
        LauncherSettingsCompanion(value: Value(value)),
      );
    } else {
      await into(launcherSettings).insert(
        LauncherSettingsCompanion(
          key: Value(key),
          value: Value(value),
        ),
      );
    }
  }

  // --- Profile Methods ---

  Stream<List<Profile>> watchProfiles() {
    return (select(profiles)
          ..orderBy([
            (t) =>
                OrderingTerm(expression: t.lastPlayed, mode: OrderingMode.desc)
          ]))
        .watch();
  }

  Future<int> createProfile(ProfilesCompanion profile) {
    return into(profiles).insert(profile);
  }

  Future<void> updateProfileLastPlayed(int id) {
    return (update(profiles)..where((t) => t.id.equals(id))).write(
      ProfilesCompanion(lastPlayed: Value(DateTime.now())),
    );
  }
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'launcher.db'));
    return NativeDatabase(file);
  });
}
