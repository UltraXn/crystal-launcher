import 'package:drift/drift.dart';

class Keybindings extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get action =>
      text().unique()(); // e.g., 'launch_game', 'open_settings'
  TextColumn get keyString => text()(); // e.g., 'F5', 'Ctrl+H'
  BoolColumn get isEnabled => boolean().withDefault(const Constant(true))();
}
