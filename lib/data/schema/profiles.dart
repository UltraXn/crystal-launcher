import 'package:drift/drift.dart';

class Profiles extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get name => text().withLength(min: 1, max: 50)();

  // Versions
  TextColumn get mcVersion => text().withDefault(const Constant('1.21.1'))();
  TextColumn get neoForgeVersion => text().nullable()();

  // Overrides (nullable = use global settings)
  TextColumn get gameDir => text().nullable()();
  IntColumn get minRam => integer().nullable()();
  IntColumn get maxRam => integer().nullable()();
  TextColumn get javaArgs => text().nullable()();
  TextColumn get javaPath => text().nullable()();

  // Meta
  DateTimeColumn get created => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get lastUsed => dateTime().nullable()();
}
