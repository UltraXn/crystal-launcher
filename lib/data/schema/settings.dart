import 'package:drift/drift.dart';

class Settings extends Table {
  // Single row enforcement usually done via logic or ID=1
  IntColumn get id => integer().autoIncrement()();

  // Java & Memory
  IntColumn get minRam => integer().withDefault(const Constant(1024))(); // MB
  IntColumn get maxRam => integer().withDefault(const Constant(4096))(); // MB
  TextColumn get javaPath => text().nullable()();

  // Game Resolution
  IntColumn get width => integer().withDefault(const Constant(1280))();
  IntColumn get height => integer().withDefault(const Constant(720))();
  BoolColumn get fullscreen => boolean().withDefault(const Constant(false))();

  // Launcher Config
  BoolColumn get closeLauncher => boolean().withDefault(const Constant(true))();
  BoolColumn get minimizeToTray =>
      boolean().withDefault(const Constant(true))();
  TextColumn get language => text().withDefault(const Constant('es'))();

  // Minecraft Version & Connection
  TextColumn get mcVersion =>
      text().withDefault(const Constant('1.21.1')).nullable()();
  TextColumn get neoForgeVersion => text()
      .withDefault(const Constant('21.1.219'))
      .nullable()(); // Default for 1.21.1
  BoolColumn get autoConnect =>
      boolean().withDefault(const Constant(true)).nullable()();

  // Profile Selection
  IntColumn get selectedProfileId => integer().nullable()();
}
