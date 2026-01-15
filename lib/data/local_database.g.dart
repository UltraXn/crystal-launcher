// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'local_database.dart';

// ignore_for_file: type=lint
class $SettingsTable extends Settings with TableInfo<$SettingsTable, Setting> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SettingsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
    'id',
    aliasedName,
    false,
    hasAutoIncrement: true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'PRIMARY KEY AUTOINCREMENT',
    ),
  );
  static const VerificationMeta _minRamMeta = const VerificationMeta('minRam');
  @override
  late final GeneratedColumn<int> minRam = GeneratedColumn<int>(
    'min_ram',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(1024),
  );
  static const VerificationMeta _maxRamMeta = const VerificationMeta('maxRam');
  @override
  late final GeneratedColumn<int> maxRam = GeneratedColumn<int>(
    'max_ram',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(4096),
  );
  static const VerificationMeta _javaPathMeta = const VerificationMeta(
    'javaPath',
  );
  @override
  late final GeneratedColumn<String> javaPath = GeneratedColumn<String>(
    'java_path',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _widthMeta = const VerificationMeta('width');
  @override
  late final GeneratedColumn<int> width = GeneratedColumn<int>(
    'width',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(1280),
  );
  static const VerificationMeta _heightMeta = const VerificationMeta('height');
  @override
  late final GeneratedColumn<int> height = GeneratedColumn<int>(
    'height',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(720),
  );
  static const VerificationMeta _fullscreenMeta = const VerificationMeta(
    'fullscreen',
  );
  @override
  late final GeneratedColumn<bool> fullscreen = GeneratedColumn<bool>(
    'fullscreen',
    aliasedName,
    false,
    type: DriftSqlType.bool,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'CHECK ("fullscreen" IN (0, 1))',
    ),
    defaultValue: const Constant(false),
  );
  static const VerificationMeta _closeLauncherMeta = const VerificationMeta(
    'closeLauncher',
  );
  @override
  late final GeneratedColumn<bool> closeLauncher = GeneratedColumn<bool>(
    'close_launcher',
    aliasedName,
    false,
    type: DriftSqlType.bool,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'CHECK ("close_launcher" IN (0, 1))',
    ),
    defaultValue: const Constant(true),
  );
  static const VerificationMeta _languageMeta = const VerificationMeta(
    'language',
  );
  @override
  late final GeneratedColumn<String> language = GeneratedColumn<String>(
    'language',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant('es'),
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    minRam,
    maxRam,
    javaPath,
    width,
    height,
    fullscreen,
    closeLauncher,
    language,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'settings';
  @override
  VerificationContext validateIntegrity(
    Insertable<Setting> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('min_ram')) {
      context.handle(
        _minRamMeta,
        minRam.isAcceptableOrUnknown(data['min_ram']!, _minRamMeta),
      );
    }
    if (data.containsKey('max_ram')) {
      context.handle(
        _maxRamMeta,
        maxRam.isAcceptableOrUnknown(data['max_ram']!, _maxRamMeta),
      );
    }
    if (data.containsKey('java_path')) {
      context.handle(
        _javaPathMeta,
        javaPath.isAcceptableOrUnknown(data['java_path']!, _javaPathMeta),
      );
    }
    if (data.containsKey('width')) {
      context.handle(
        _widthMeta,
        width.isAcceptableOrUnknown(data['width']!, _widthMeta),
      );
    }
    if (data.containsKey('height')) {
      context.handle(
        _heightMeta,
        height.isAcceptableOrUnknown(data['height']!, _heightMeta),
      );
    }
    if (data.containsKey('fullscreen')) {
      context.handle(
        _fullscreenMeta,
        fullscreen.isAcceptableOrUnknown(data['fullscreen']!, _fullscreenMeta),
      );
    }
    if (data.containsKey('close_launcher')) {
      context.handle(
        _closeLauncherMeta,
        closeLauncher.isAcceptableOrUnknown(
          data['close_launcher']!,
          _closeLauncherMeta,
        ),
      );
    }
    if (data.containsKey('language')) {
      context.handle(
        _languageMeta,
        language.isAcceptableOrUnknown(data['language']!, _languageMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Setting map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Setting(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}id'],
      )!,
      minRam: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}min_ram'],
      )!,
      maxRam: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}max_ram'],
      )!,
      javaPath: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}java_path'],
      ),
      width: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}width'],
      )!,
      height: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}height'],
      )!,
      fullscreen: attachedDatabase.typeMapping.read(
        DriftSqlType.bool,
        data['${effectivePrefix}fullscreen'],
      )!,
      closeLauncher: attachedDatabase.typeMapping.read(
        DriftSqlType.bool,
        data['${effectivePrefix}close_launcher'],
      )!,
      language: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}language'],
      )!,
    );
  }

  @override
  $SettingsTable createAlias(String alias) {
    return $SettingsTable(attachedDatabase, alias);
  }
}

class Setting extends DataClass implements Insertable<Setting> {
  final int id;
  final int minRam;
  final int maxRam;
  final String? javaPath;
  final int width;
  final int height;
  final bool fullscreen;
  final bool closeLauncher;
  final String language;
  const Setting({
    required this.id,
    required this.minRam,
    required this.maxRam,
    this.javaPath,
    required this.width,
    required this.height,
    required this.fullscreen,
    required this.closeLauncher,
    required this.language,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['min_ram'] = Variable<int>(minRam);
    map['max_ram'] = Variable<int>(maxRam);
    if (!nullToAbsent || javaPath != null) {
      map['java_path'] = Variable<String>(javaPath);
    }
    map['width'] = Variable<int>(width);
    map['height'] = Variable<int>(height);
    map['fullscreen'] = Variable<bool>(fullscreen);
    map['close_launcher'] = Variable<bool>(closeLauncher);
    map['language'] = Variable<String>(language);
    return map;
  }

  SettingsCompanion toCompanion(bool nullToAbsent) {
    return SettingsCompanion(
      id: Value(id),
      minRam: Value(minRam),
      maxRam: Value(maxRam),
      javaPath: javaPath == null && nullToAbsent
          ? const Value.absent()
          : Value(javaPath),
      width: Value(width),
      height: Value(height),
      fullscreen: Value(fullscreen),
      closeLauncher: Value(closeLauncher),
      language: Value(language),
    );
  }

  factory Setting.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Setting(
      id: serializer.fromJson<int>(json['id']),
      minRam: serializer.fromJson<int>(json['minRam']),
      maxRam: serializer.fromJson<int>(json['maxRam']),
      javaPath: serializer.fromJson<String?>(json['javaPath']),
      width: serializer.fromJson<int>(json['width']),
      height: serializer.fromJson<int>(json['height']),
      fullscreen: serializer.fromJson<bool>(json['fullscreen']),
      closeLauncher: serializer.fromJson<bool>(json['closeLauncher']),
      language: serializer.fromJson<String>(json['language']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'minRam': serializer.toJson<int>(minRam),
      'maxRam': serializer.toJson<int>(maxRam),
      'javaPath': serializer.toJson<String?>(javaPath),
      'width': serializer.toJson<int>(width),
      'height': serializer.toJson<int>(height),
      'fullscreen': serializer.toJson<bool>(fullscreen),
      'closeLauncher': serializer.toJson<bool>(closeLauncher),
      'language': serializer.toJson<String>(language),
    };
  }

  Setting copyWith({
    int? id,
    int? minRam,
    int? maxRam,
    Value<String?> javaPath = const Value.absent(),
    int? width,
    int? height,
    bool? fullscreen,
    bool? closeLauncher,
    String? language,
  }) => Setting(
    id: id ?? this.id,
    minRam: minRam ?? this.minRam,
    maxRam: maxRam ?? this.maxRam,
    javaPath: javaPath.present ? javaPath.value : this.javaPath,
    width: width ?? this.width,
    height: height ?? this.height,
    fullscreen: fullscreen ?? this.fullscreen,
    closeLauncher: closeLauncher ?? this.closeLauncher,
    language: language ?? this.language,
  );
  Setting copyWithCompanion(SettingsCompanion data) {
    return Setting(
      id: data.id.present ? data.id.value : this.id,
      minRam: data.minRam.present ? data.minRam.value : this.minRam,
      maxRam: data.maxRam.present ? data.maxRam.value : this.maxRam,
      javaPath: data.javaPath.present ? data.javaPath.value : this.javaPath,
      width: data.width.present ? data.width.value : this.width,
      height: data.height.present ? data.height.value : this.height,
      fullscreen: data.fullscreen.present
          ? data.fullscreen.value
          : this.fullscreen,
      closeLauncher: data.closeLauncher.present
          ? data.closeLauncher.value
          : this.closeLauncher,
      language: data.language.present ? data.language.value : this.language,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Setting(')
          ..write('id: $id, ')
          ..write('minRam: $minRam, ')
          ..write('maxRam: $maxRam, ')
          ..write('javaPath: $javaPath, ')
          ..write('width: $width, ')
          ..write('height: $height, ')
          ..write('fullscreen: $fullscreen, ')
          ..write('closeLauncher: $closeLauncher, ')
          ..write('language: $language')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    minRam,
    maxRam,
    javaPath,
    width,
    height,
    fullscreen,
    closeLauncher,
    language,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Setting &&
          other.id == this.id &&
          other.minRam == this.minRam &&
          other.maxRam == this.maxRam &&
          other.javaPath == this.javaPath &&
          other.width == this.width &&
          other.height == this.height &&
          other.fullscreen == this.fullscreen &&
          other.closeLauncher == this.closeLauncher &&
          other.language == this.language);
}

class SettingsCompanion extends UpdateCompanion<Setting> {
  final Value<int> id;
  final Value<int> minRam;
  final Value<int> maxRam;
  final Value<String?> javaPath;
  final Value<int> width;
  final Value<int> height;
  final Value<bool> fullscreen;
  final Value<bool> closeLauncher;
  final Value<String> language;
  const SettingsCompanion({
    this.id = const Value.absent(),
    this.minRam = const Value.absent(),
    this.maxRam = const Value.absent(),
    this.javaPath = const Value.absent(),
    this.width = const Value.absent(),
    this.height = const Value.absent(),
    this.fullscreen = const Value.absent(),
    this.closeLauncher = const Value.absent(),
    this.language = const Value.absent(),
  });
  SettingsCompanion.insert({
    this.id = const Value.absent(),
    this.minRam = const Value.absent(),
    this.maxRam = const Value.absent(),
    this.javaPath = const Value.absent(),
    this.width = const Value.absent(),
    this.height = const Value.absent(),
    this.fullscreen = const Value.absent(),
    this.closeLauncher = const Value.absent(),
    this.language = const Value.absent(),
  });
  static Insertable<Setting> custom({
    Expression<int>? id,
    Expression<int>? minRam,
    Expression<int>? maxRam,
    Expression<String>? javaPath,
    Expression<int>? width,
    Expression<int>? height,
    Expression<bool>? fullscreen,
    Expression<bool>? closeLauncher,
    Expression<String>? language,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (minRam != null) 'min_ram': minRam,
      if (maxRam != null) 'max_ram': maxRam,
      if (javaPath != null) 'java_path': javaPath,
      if (width != null) 'width': width,
      if (height != null) 'height': height,
      if (fullscreen != null) 'fullscreen': fullscreen,
      if (closeLauncher != null) 'close_launcher': closeLauncher,
      if (language != null) 'language': language,
    });
  }

  SettingsCompanion copyWith({
    Value<int>? id,
    Value<int>? minRam,
    Value<int>? maxRam,
    Value<String?>? javaPath,
    Value<int>? width,
    Value<int>? height,
    Value<bool>? fullscreen,
    Value<bool>? closeLauncher,
    Value<String>? language,
  }) {
    return SettingsCompanion(
      id: id ?? this.id,
      minRam: minRam ?? this.minRam,
      maxRam: maxRam ?? this.maxRam,
      javaPath: javaPath ?? this.javaPath,
      width: width ?? this.width,
      height: height ?? this.height,
      fullscreen: fullscreen ?? this.fullscreen,
      closeLauncher: closeLauncher ?? this.closeLauncher,
      language: language ?? this.language,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (minRam.present) {
      map['min_ram'] = Variable<int>(minRam.value);
    }
    if (maxRam.present) {
      map['max_ram'] = Variable<int>(maxRam.value);
    }
    if (javaPath.present) {
      map['java_path'] = Variable<String>(javaPath.value);
    }
    if (width.present) {
      map['width'] = Variable<int>(width.value);
    }
    if (height.present) {
      map['height'] = Variable<int>(height.value);
    }
    if (fullscreen.present) {
      map['fullscreen'] = Variable<bool>(fullscreen.value);
    }
    if (closeLauncher.present) {
      map['close_launcher'] = Variable<bool>(closeLauncher.value);
    }
    if (language.present) {
      map['language'] = Variable<String>(language.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SettingsCompanion(')
          ..write('id: $id, ')
          ..write('minRam: $minRam, ')
          ..write('maxRam: $maxRam, ')
          ..write('javaPath: $javaPath, ')
          ..write('width: $width, ')
          ..write('height: $height, ')
          ..write('fullscreen: $fullscreen, ')
          ..write('closeLauncher: $closeLauncher, ')
          ..write('language: $language')
          ..write(')'))
        .toString();
  }
}

abstract class _$LocalDatabase extends GeneratedDatabase {
  _$LocalDatabase(QueryExecutor e) : super(e);
  $LocalDatabaseManager get managers => $LocalDatabaseManager(this);
  late final $SettingsTable settings = $SettingsTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [settings];
}

typedef $$SettingsTableCreateCompanionBuilder =
    SettingsCompanion Function({
      Value<int> id,
      Value<int> minRam,
      Value<int> maxRam,
      Value<String?> javaPath,
      Value<int> width,
      Value<int> height,
      Value<bool> fullscreen,
      Value<bool> closeLauncher,
      Value<String> language,
    });
typedef $$SettingsTableUpdateCompanionBuilder =
    SettingsCompanion Function({
      Value<int> id,
      Value<int> minRam,
      Value<int> maxRam,
      Value<String?> javaPath,
      Value<int> width,
      Value<int> height,
      Value<bool> fullscreen,
      Value<bool> closeLauncher,
      Value<String> language,
    });

class $$SettingsTableFilterComposer
    extends Composer<_$LocalDatabase, $SettingsTable> {
  $$SettingsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get minRam => $composableBuilder(
    column: $table.minRam,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get maxRam => $composableBuilder(
    column: $table.maxRam,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get javaPath => $composableBuilder(
    column: $table.javaPath,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get width => $composableBuilder(
    column: $table.width,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get height => $composableBuilder(
    column: $table.height,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<bool> get fullscreen => $composableBuilder(
    column: $table.fullscreen,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<bool> get closeLauncher => $composableBuilder(
    column: $table.closeLauncher,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get language => $composableBuilder(
    column: $table.language,
    builder: (column) => ColumnFilters(column),
  );
}

class $$SettingsTableOrderingComposer
    extends Composer<_$LocalDatabase, $SettingsTable> {
  $$SettingsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get minRam => $composableBuilder(
    column: $table.minRam,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get maxRam => $composableBuilder(
    column: $table.maxRam,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get javaPath => $composableBuilder(
    column: $table.javaPath,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get width => $composableBuilder(
    column: $table.width,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get height => $composableBuilder(
    column: $table.height,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<bool> get fullscreen => $composableBuilder(
    column: $table.fullscreen,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<bool> get closeLauncher => $composableBuilder(
    column: $table.closeLauncher,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get language => $composableBuilder(
    column: $table.language,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$SettingsTableAnnotationComposer
    extends Composer<_$LocalDatabase, $SettingsTable> {
  $$SettingsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<int> get minRam =>
      $composableBuilder(column: $table.minRam, builder: (column) => column);

  GeneratedColumn<int> get maxRam =>
      $composableBuilder(column: $table.maxRam, builder: (column) => column);

  GeneratedColumn<String> get javaPath =>
      $composableBuilder(column: $table.javaPath, builder: (column) => column);

  GeneratedColumn<int> get width =>
      $composableBuilder(column: $table.width, builder: (column) => column);

  GeneratedColumn<int> get height =>
      $composableBuilder(column: $table.height, builder: (column) => column);

  GeneratedColumn<bool> get fullscreen => $composableBuilder(
    column: $table.fullscreen,
    builder: (column) => column,
  );

  GeneratedColumn<bool> get closeLauncher => $composableBuilder(
    column: $table.closeLauncher,
    builder: (column) => column,
  );

  GeneratedColumn<String> get language =>
      $composableBuilder(column: $table.language, builder: (column) => column);
}

class $$SettingsTableTableManager
    extends
        RootTableManager<
          _$LocalDatabase,
          $SettingsTable,
          Setting,
          $$SettingsTableFilterComposer,
          $$SettingsTableOrderingComposer,
          $$SettingsTableAnnotationComposer,
          $$SettingsTableCreateCompanionBuilder,
          $$SettingsTableUpdateCompanionBuilder,
          (Setting, BaseReferences<_$LocalDatabase, $SettingsTable, Setting>),
          Setting,
          PrefetchHooks Function()
        > {
  $$SettingsTableTableManager(_$LocalDatabase db, $SettingsTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SettingsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SettingsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SettingsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<int> minRam = const Value.absent(),
                Value<int> maxRam = const Value.absent(),
                Value<String?> javaPath = const Value.absent(),
                Value<int> width = const Value.absent(),
                Value<int> height = const Value.absent(),
                Value<bool> fullscreen = const Value.absent(),
                Value<bool> closeLauncher = const Value.absent(),
                Value<String> language = const Value.absent(),
              }) => SettingsCompanion(
                id: id,
                minRam: minRam,
                maxRam: maxRam,
                javaPath: javaPath,
                width: width,
                height: height,
                fullscreen: fullscreen,
                closeLauncher: closeLauncher,
                language: language,
              ),
          createCompanionCallback:
              ({
                Value<int> id = const Value.absent(),
                Value<int> minRam = const Value.absent(),
                Value<int> maxRam = const Value.absent(),
                Value<String?> javaPath = const Value.absent(),
                Value<int> width = const Value.absent(),
                Value<int> height = const Value.absent(),
                Value<bool> fullscreen = const Value.absent(),
                Value<bool> closeLauncher = const Value.absent(),
                Value<String> language = const Value.absent(),
              }) => SettingsCompanion.insert(
                id: id,
                minRam: minRam,
                maxRam: maxRam,
                javaPath: javaPath,
                width: width,
                height: height,
                fullscreen: fullscreen,
                closeLauncher: closeLauncher,
                language: language,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$SettingsTableProcessedTableManager =
    ProcessedTableManager<
      _$LocalDatabase,
      $SettingsTable,
      Setting,
      $$SettingsTableFilterComposer,
      $$SettingsTableOrderingComposer,
      $$SettingsTableAnnotationComposer,
      $$SettingsTableCreateCompanionBuilder,
      $$SettingsTableUpdateCompanionBuilder,
      (Setting, BaseReferences<_$LocalDatabase, $SettingsTable, Setting>),
      Setting,
      PrefetchHooks Function()
    >;

class $LocalDatabaseManager {
  final _$LocalDatabase _db;
  $LocalDatabaseManager(this._db);
  $$SettingsTableTableManager get settings =>
      $$SettingsTableTableManager(_db, _db.settings);
}
