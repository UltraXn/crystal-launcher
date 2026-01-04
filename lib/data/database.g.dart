// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'database.dart';

// ignore_for_file: type=lint
class $LauncherSettingsTable extends LauncherSettings
    with TableInfo<$LauncherSettingsTable, LauncherSetting> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LauncherSettingsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _keyMeta = const VerificationMeta('key');
  @override
  late final GeneratedColumn<String> key = GeneratedColumn<String>(
      'key', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: true,
      defaultConstraints: GeneratedColumn.constraintIsAlways('UNIQUE'));
  static const VerificationMeta _valueMeta = const VerificationMeta('value');
  @override
  late final GeneratedColumn<String> value = GeneratedColumn<String>(
      'value', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  @override
  List<GeneratedColumn> get $columns => [id, key, value];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'launcher_settings';
  @override
  VerificationContext validateIntegrity(Insertable<LauncherSetting> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('key')) {
      context.handle(
          _keyMeta, key.isAcceptableOrUnknown(data['key']!, _keyMeta));
    } else if (isInserting) {
      context.missing(_keyMeta);
    }
    if (data.containsKey('value')) {
      context.handle(
          _valueMeta, value.isAcceptableOrUnknown(data['value']!, _valueMeta));
    } else if (isInserting) {
      context.missing(_valueMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  LauncherSetting map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LauncherSetting(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      key: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}key'])!,
      value: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}value'])!,
    );
  }

  @override
  $LauncherSettingsTable createAlias(String alias) {
    return $LauncherSettingsTable(attachedDatabase, alias);
  }
}

class LauncherSetting extends DataClass implements Insertable<LauncherSetting> {
  final int id;
  final String key;
  final String value;
  const LauncherSetting(
      {required this.id, required this.key, required this.value});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['key'] = Variable<String>(key);
    map['value'] = Variable<String>(value);
    return map;
  }

  LauncherSettingsCompanion toCompanion(bool nullToAbsent) {
    return LauncherSettingsCompanion(
      id: Value(id),
      key: Value(key),
      value: Value(value),
    );
  }

  factory LauncherSetting.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LauncherSetting(
      id: serializer.fromJson<int>(json['id']),
      key: serializer.fromJson<String>(json['key']),
      value: serializer.fromJson<String>(json['value']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'key': serializer.toJson<String>(key),
      'value': serializer.toJson<String>(value),
    };
  }

  LauncherSetting copyWith({int? id, String? key, String? value}) =>
      LauncherSetting(
        id: id ?? this.id,
        key: key ?? this.key,
        value: value ?? this.value,
      );
  LauncherSetting copyWithCompanion(LauncherSettingsCompanion data) {
    return LauncherSetting(
      id: data.id.present ? data.id.value : this.id,
      key: data.key.present ? data.key.value : this.key,
      value: data.value.present ? data.value.value : this.value,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LauncherSetting(')
          ..write('id: $id, ')
          ..write('key: $key, ')
          ..write('value: $value')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, key, value);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LauncherSetting &&
          other.id == this.id &&
          other.key == this.key &&
          other.value == this.value);
}

class LauncherSettingsCompanion extends UpdateCompanion<LauncherSetting> {
  final Value<int> id;
  final Value<String> key;
  final Value<String> value;
  const LauncherSettingsCompanion({
    this.id = const Value.absent(),
    this.key = const Value.absent(),
    this.value = const Value.absent(),
  });
  LauncherSettingsCompanion.insert({
    this.id = const Value.absent(),
    required String key,
    required String value,
  })  : key = Value(key),
        value = Value(value);
  static Insertable<LauncherSetting> custom({
    Expression<int>? id,
    Expression<String>? key,
    Expression<String>? value,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (key != null) 'key': key,
      if (value != null) 'value': value,
    });
  }

  LauncherSettingsCompanion copyWith(
      {Value<int>? id, Value<String>? key, Value<String>? value}) {
    return LauncherSettingsCompanion(
      id: id ?? this.id,
      key: key ?? this.key,
      value: value ?? this.value,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (key.present) {
      map['key'] = Variable<String>(key.value);
    }
    if (value.present) {
      map['value'] = Variable<String>(value.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LauncherSettingsCompanion(')
          ..write('id: $id, ')
          ..write('key: $key, ')
          ..write('value: $value')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $LauncherSettingsTable launcherSettings =
      $LauncherSettingsTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [launcherSettings];
}

typedef $$LauncherSettingsTableCreateCompanionBuilder
    = LauncherSettingsCompanion Function({
  Value<int> id,
  required String key,
  required String value,
});
typedef $$LauncherSettingsTableUpdateCompanionBuilder
    = LauncherSettingsCompanion Function({
  Value<int> id,
  Value<String> key,
  Value<String> value,
});

class $$LauncherSettingsTableFilterComposer
    extends Composer<_$AppDatabase, $LauncherSettingsTable> {
  $$LauncherSettingsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get key => $composableBuilder(
      column: $table.key, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get value => $composableBuilder(
      column: $table.value, builder: (column) => ColumnFilters(column));
}

class $$LauncherSettingsTableOrderingComposer
    extends Composer<_$AppDatabase, $LauncherSettingsTable> {
  $$LauncherSettingsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get key => $composableBuilder(
      column: $table.key, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get value => $composableBuilder(
      column: $table.value, builder: (column) => ColumnOrderings(column));
}

class $$LauncherSettingsTableAnnotationComposer
    extends Composer<_$AppDatabase, $LauncherSettingsTable> {
  $$LauncherSettingsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get key =>
      $composableBuilder(column: $table.key, builder: (column) => column);

  GeneratedColumn<String> get value =>
      $composableBuilder(column: $table.value, builder: (column) => column);
}

class $$LauncherSettingsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $LauncherSettingsTable,
    LauncherSetting,
    $$LauncherSettingsTableFilterComposer,
    $$LauncherSettingsTableOrderingComposer,
    $$LauncherSettingsTableAnnotationComposer,
    $$LauncherSettingsTableCreateCompanionBuilder,
    $$LauncherSettingsTableUpdateCompanionBuilder,
    (
      LauncherSetting,
      BaseReferences<_$AppDatabase, $LauncherSettingsTable, LauncherSetting>
    ),
    LauncherSetting,
    PrefetchHooks Function()> {
  $$LauncherSettingsTableTableManager(
      _$AppDatabase db, $LauncherSettingsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$LauncherSettingsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$LauncherSettingsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$LauncherSettingsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<String> key = const Value.absent(),
            Value<String> value = const Value.absent(),
          }) =>
              LauncherSettingsCompanion(
            id: id,
            key: key,
            value: value,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required String key,
            required String value,
          }) =>
              LauncherSettingsCompanion.insert(
            id: id,
            key: key,
            value: value,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$LauncherSettingsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $LauncherSettingsTable,
    LauncherSetting,
    $$LauncherSettingsTableFilterComposer,
    $$LauncherSettingsTableOrderingComposer,
    $$LauncherSettingsTableAnnotationComposer,
    $$LauncherSettingsTableCreateCompanionBuilder,
    $$LauncherSettingsTableUpdateCompanionBuilder,
    (
      LauncherSetting,
      BaseReferences<_$AppDatabase, $LauncherSettingsTable, LauncherSetting>
    ),
    LauncherSetting,
    PrefetchHooks Function()>;

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$LauncherSettingsTableTableManager get launcherSettings =>
      $$LauncherSettingsTableTableManager(_db, _db.launcherSettings);
}
