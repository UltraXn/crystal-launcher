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
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _minRamMeta = const VerificationMeta('minRam');
  @override
  late final GeneratedColumn<int> minRam = GeneratedColumn<int>(
      'min_ram', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(1024));
  static const VerificationMeta _maxRamMeta = const VerificationMeta('maxRam');
  @override
  late final GeneratedColumn<int> maxRam = GeneratedColumn<int>(
      'max_ram', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(4096));
  static const VerificationMeta _javaPathMeta =
      const VerificationMeta('javaPath');
  @override
  late final GeneratedColumn<String> javaPath = GeneratedColumn<String>(
      'java_path', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _widthMeta = const VerificationMeta('width');
  @override
  late final GeneratedColumn<int> width = GeneratedColumn<int>(
      'width', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(1280));
  static const VerificationMeta _heightMeta = const VerificationMeta('height');
  @override
  late final GeneratedColumn<int> height = GeneratedColumn<int>(
      'height', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(720));
  static const VerificationMeta _fullscreenMeta =
      const VerificationMeta('fullscreen');
  @override
  late final GeneratedColumn<bool> fullscreen = GeneratedColumn<bool>(
      'fullscreen', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('CHECK ("fullscreen" IN (0, 1))'),
      defaultValue: const Constant(false));
  static const VerificationMeta _closeLauncherMeta =
      const VerificationMeta('closeLauncher');
  @override
  late final GeneratedColumn<bool> closeLauncher = GeneratedColumn<bool>(
      'close_launcher', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'CHECK ("close_launcher" IN (0, 1))'),
      defaultValue: const Constant(true));
  static const VerificationMeta _languageMeta =
      const VerificationMeta('language');
  @override
  late final GeneratedColumn<String> language = GeneratedColumn<String>(
      'language', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('es'));
  static const VerificationMeta _mcVersionMeta =
      const VerificationMeta('mcVersion');
  @override
  late final GeneratedColumn<String> mcVersion = GeneratedColumn<String>(
      'mc_version', aliasedName, true,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('1.21.1'));
  static const VerificationMeta _neoForgeVersionMeta =
      const VerificationMeta('neoForgeVersion');
  @override
  late final GeneratedColumn<String> neoForgeVersion = GeneratedColumn<String>(
      'neo_forge_version', aliasedName, true,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('21.1.219'));
  static const VerificationMeta _autoConnectMeta =
      const VerificationMeta('autoConnect');
  @override
  late final GeneratedColumn<bool> autoConnect = GeneratedColumn<bool>(
      'auto_connect', aliasedName, true,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'CHECK ("auto_connect" IN (0, 1))'),
      defaultValue: const Constant(true));
  static const VerificationMeta _selectedProfileIdMeta =
      const VerificationMeta('selectedProfileId');
  @override
  late final GeneratedColumn<int> selectedProfileId = GeneratedColumn<int>(
      'selected_profile_id', aliasedName, true,
      type: DriftSqlType.int, requiredDuringInsert: false);
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
        mcVersion,
        neoForgeVersion,
        autoConnect,
        selectedProfileId
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'settings';
  @override
  VerificationContext validateIntegrity(Insertable<Setting> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('min_ram')) {
      context.handle(_minRamMeta,
          minRam.isAcceptableOrUnknown(data['min_ram']!, _minRamMeta));
    }
    if (data.containsKey('max_ram')) {
      context.handle(_maxRamMeta,
          maxRam.isAcceptableOrUnknown(data['max_ram']!, _maxRamMeta));
    }
    if (data.containsKey('java_path')) {
      context.handle(_javaPathMeta,
          javaPath.isAcceptableOrUnknown(data['java_path']!, _javaPathMeta));
    }
    if (data.containsKey('width')) {
      context.handle(
          _widthMeta, width.isAcceptableOrUnknown(data['width']!, _widthMeta));
    }
    if (data.containsKey('height')) {
      context.handle(_heightMeta,
          height.isAcceptableOrUnknown(data['height']!, _heightMeta));
    }
    if (data.containsKey('fullscreen')) {
      context.handle(
          _fullscreenMeta,
          fullscreen.isAcceptableOrUnknown(
              data['fullscreen']!, _fullscreenMeta));
    }
    if (data.containsKey('close_launcher')) {
      context.handle(
          _closeLauncherMeta,
          closeLauncher.isAcceptableOrUnknown(
              data['close_launcher']!, _closeLauncherMeta));
    }
    if (data.containsKey('language')) {
      context.handle(_languageMeta,
          language.isAcceptableOrUnknown(data['language']!, _languageMeta));
    }
    if (data.containsKey('mc_version')) {
      context.handle(_mcVersionMeta,
          mcVersion.isAcceptableOrUnknown(data['mc_version']!, _mcVersionMeta));
    }
    if (data.containsKey('neo_forge_version')) {
      context.handle(
          _neoForgeVersionMeta,
          neoForgeVersion.isAcceptableOrUnknown(
              data['neo_forge_version']!, _neoForgeVersionMeta));
    }
    if (data.containsKey('auto_connect')) {
      context.handle(
          _autoConnectMeta,
          autoConnect.isAcceptableOrUnknown(
              data['auto_connect']!, _autoConnectMeta));
    }
    if (data.containsKey('selected_profile_id')) {
      context.handle(
          _selectedProfileIdMeta,
          selectedProfileId.isAcceptableOrUnknown(
              data['selected_profile_id']!, _selectedProfileIdMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Setting map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Setting(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      minRam: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}min_ram'])!,
      maxRam: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}max_ram'])!,
      javaPath: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}java_path']),
      width: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}width'])!,
      height: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}height'])!,
      fullscreen: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}fullscreen'])!,
      closeLauncher: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}close_launcher'])!,
      language: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}language'])!,
      mcVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}mc_version']),
      neoForgeVersion: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}neo_forge_version']),
      autoConnect: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}auto_connect']),
      selectedProfileId: attachedDatabase.typeMapping.read(
          DriftSqlType.int, data['${effectivePrefix}selected_profile_id']),
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
  final String? mcVersion;
  final String? neoForgeVersion;
  final bool? autoConnect;
  final int? selectedProfileId;
  const Setting(
      {required this.id,
      required this.minRam,
      required this.maxRam,
      this.javaPath,
      required this.width,
      required this.height,
      required this.fullscreen,
      required this.closeLauncher,
      required this.language,
      this.mcVersion,
      this.neoForgeVersion,
      this.autoConnect,
      this.selectedProfileId});
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
    if (!nullToAbsent || mcVersion != null) {
      map['mc_version'] = Variable<String>(mcVersion);
    }
    if (!nullToAbsent || neoForgeVersion != null) {
      map['neo_forge_version'] = Variable<String>(neoForgeVersion);
    }
    if (!nullToAbsent || autoConnect != null) {
      map['auto_connect'] = Variable<bool>(autoConnect);
    }
    if (!nullToAbsent || selectedProfileId != null) {
      map['selected_profile_id'] = Variable<int>(selectedProfileId);
    }
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
      mcVersion: mcVersion == null && nullToAbsent
          ? const Value.absent()
          : Value(mcVersion),
      neoForgeVersion: neoForgeVersion == null && nullToAbsent
          ? const Value.absent()
          : Value(neoForgeVersion),
      autoConnect: autoConnect == null && nullToAbsent
          ? const Value.absent()
          : Value(autoConnect),
      selectedProfileId: selectedProfileId == null && nullToAbsent
          ? const Value.absent()
          : Value(selectedProfileId),
    );
  }

  factory Setting.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
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
      mcVersion: serializer.fromJson<String?>(json['mcVersion']),
      neoForgeVersion: serializer.fromJson<String?>(json['neoForgeVersion']),
      autoConnect: serializer.fromJson<bool?>(json['autoConnect']),
      selectedProfileId: serializer.fromJson<int?>(json['selectedProfileId']),
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
      'mcVersion': serializer.toJson<String?>(mcVersion),
      'neoForgeVersion': serializer.toJson<String?>(neoForgeVersion),
      'autoConnect': serializer.toJson<bool?>(autoConnect),
      'selectedProfileId': serializer.toJson<int?>(selectedProfileId),
    };
  }

  Setting copyWith(
          {int? id,
          int? minRam,
          int? maxRam,
          Value<String?> javaPath = const Value.absent(),
          int? width,
          int? height,
          bool? fullscreen,
          bool? closeLauncher,
          String? language,
          Value<String?> mcVersion = const Value.absent(),
          Value<String?> neoForgeVersion = const Value.absent(),
          Value<bool?> autoConnect = const Value.absent(),
          Value<int?> selectedProfileId = const Value.absent()}) =>
      Setting(
        id: id ?? this.id,
        minRam: minRam ?? this.minRam,
        maxRam: maxRam ?? this.maxRam,
        javaPath: javaPath.present ? javaPath.value : this.javaPath,
        width: width ?? this.width,
        height: height ?? this.height,
        fullscreen: fullscreen ?? this.fullscreen,
        closeLauncher: closeLauncher ?? this.closeLauncher,
        language: language ?? this.language,
        mcVersion: mcVersion.present ? mcVersion.value : this.mcVersion,
        neoForgeVersion: neoForgeVersion.present
            ? neoForgeVersion.value
            : this.neoForgeVersion,
        autoConnect: autoConnect.present ? autoConnect.value : this.autoConnect,
        selectedProfileId: selectedProfileId.present
            ? selectedProfileId.value
            : this.selectedProfileId,
      );
  Setting copyWithCompanion(SettingsCompanion data) {
    return Setting(
      id: data.id.present ? data.id.value : this.id,
      minRam: data.minRam.present ? data.minRam.value : this.minRam,
      maxRam: data.maxRam.present ? data.maxRam.value : this.maxRam,
      javaPath: data.javaPath.present ? data.javaPath.value : this.javaPath,
      width: data.width.present ? data.width.value : this.width,
      height: data.height.present ? data.height.value : this.height,
      fullscreen:
          data.fullscreen.present ? data.fullscreen.value : this.fullscreen,
      closeLauncher: data.closeLauncher.present
          ? data.closeLauncher.value
          : this.closeLauncher,
      language: data.language.present ? data.language.value : this.language,
      mcVersion: data.mcVersion.present ? data.mcVersion.value : this.mcVersion,
      neoForgeVersion: data.neoForgeVersion.present
          ? data.neoForgeVersion.value
          : this.neoForgeVersion,
      autoConnect:
          data.autoConnect.present ? data.autoConnect.value : this.autoConnect,
      selectedProfileId: data.selectedProfileId.present
          ? data.selectedProfileId.value
          : this.selectedProfileId,
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
          ..write('language: $language, ')
          ..write('mcVersion: $mcVersion, ')
          ..write('neoForgeVersion: $neoForgeVersion, ')
          ..write('autoConnect: $autoConnect, ')
          ..write('selectedProfileId: $selectedProfileId')
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
      mcVersion,
      neoForgeVersion,
      autoConnect,
      selectedProfileId);
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
          other.language == this.language &&
          other.mcVersion == this.mcVersion &&
          other.neoForgeVersion == this.neoForgeVersion &&
          other.autoConnect == this.autoConnect &&
          other.selectedProfileId == this.selectedProfileId);
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
  final Value<String?> mcVersion;
  final Value<String?> neoForgeVersion;
  final Value<bool?> autoConnect;
  final Value<int?> selectedProfileId;
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
    this.mcVersion = const Value.absent(),
    this.neoForgeVersion = const Value.absent(),
    this.autoConnect = const Value.absent(),
    this.selectedProfileId = const Value.absent(),
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
    this.mcVersion = const Value.absent(),
    this.neoForgeVersion = const Value.absent(),
    this.autoConnect = const Value.absent(),
    this.selectedProfileId = const Value.absent(),
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
    Expression<String>? mcVersion,
    Expression<String>? neoForgeVersion,
    Expression<bool>? autoConnect,
    Expression<int>? selectedProfileId,
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
      if (mcVersion != null) 'mc_version': mcVersion,
      if (neoForgeVersion != null) 'neo_forge_version': neoForgeVersion,
      if (autoConnect != null) 'auto_connect': autoConnect,
      if (selectedProfileId != null) 'selected_profile_id': selectedProfileId,
    });
  }

  SettingsCompanion copyWith(
      {Value<int>? id,
      Value<int>? minRam,
      Value<int>? maxRam,
      Value<String?>? javaPath,
      Value<int>? width,
      Value<int>? height,
      Value<bool>? fullscreen,
      Value<bool>? closeLauncher,
      Value<String>? language,
      Value<String?>? mcVersion,
      Value<String?>? neoForgeVersion,
      Value<bool?>? autoConnect,
      Value<int?>? selectedProfileId}) {
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
      mcVersion: mcVersion ?? this.mcVersion,
      neoForgeVersion: neoForgeVersion ?? this.neoForgeVersion,
      autoConnect: autoConnect ?? this.autoConnect,
      selectedProfileId: selectedProfileId ?? this.selectedProfileId,
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
    if (mcVersion.present) {
      map['mc_version'] = Variable<String>(mcVersion.value);
    }
    if (neoForgeVersion.present) {
      map['neo_forge_version'] = Variable<String>(neoForgeVersion.value);
    }
    if (autoConnect.present) {
      map['auto_connect'] = Variable<bool>(autoConnect.value);
    }
    if (selectedProfileId.present) {
      map['selected_profile_id'] = Variable<int>(selectedProfileId.value);
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
          ..write('language: $language, ')
          ..write('mcVersion: $mcVersion, ')
          ..write('neoForgeVersion: $neoForgeVersion, ')
          ..write('autoConnect: $autoConnect, ')
          ..write('selectedProfileId: $selectedProfileId')
          ..write(')'))
        .toString();
  }
}

class $KeybindingsTable extends Keybindings
    with TableInfo<$KeybindingsTable, Keybinding> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $KeybindingsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _actionMeta = const VerificationMeta('action');
  @override
  late final GeneratedColumn<String> action = GeneratedColumn<String>(
      'action', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: true,
      defaultConstraints: GeneratedColumn.constraintIsAlways('UNIQUE'));
  static const VerificationMeta _keyStringMeta =
      const VerificationMeta('keyString');
  @override
  late final GeneratedColumn<String> keyString = GeneratedColumn<String>(
      'key_string', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _isEnabledMeta =
      const VerificationMeta('isEnabled');
  @override
  late final GeneratedColumn<bool> isEnabled = GeneratedColumn<bool>(
      'is_enabled', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('CHECK ("is_enabled" IN (0, 1))'),
      defaultValue: const Constant(true));
  @override
  List<GeneratedColumn> get $columns => [id, action, keyString, isEnabled];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'keybindings';
  @override
  VerificationContext validateIntegrity(Insertable<Keybinding> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('action')) {
      context.handle(_actionMeta,
          action.isAcceptableOrUnknown(data['action']!, _actionMeta));
    } else if (isInserting) {
      context.missing(_actionMeta);
    }
    if (data.containsKey('key_string')) {
      context.handle(_keyStringMeta,
          keyString.isAcceptableOrUnknown(data['key_string']!, _keyStringMeta));
    } else if (isInserting) {
      context.missing(_keyStringMeta);
    }
    if (data.containsKey('is_enabled')) {
      context.handle(_isEnabledMeta,
          isEnabled.isAcceptableOrUnknown(data['is_enabled']!, _isEnabledMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Keybinding map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Keybinding(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      action: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}action'])!,
      keyString: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}key_string'])!,
      isEnabled: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}is_enabled'])!,
    );
  }

  @override
  $KeybindingsTable createAlias(String alias) {
    return $KeybindingsTable(attachedDatabase, alias);
  }
}

class Keybinding extends DataClass implements Insertable<Keybinding> {
  final int id;
  final String action;
  final String keyString;
  final bool isEnabled;
  const Keybinding(
      {required this.id,
      required this.action,
      required this.keyString,
      required this.isEnabled});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['action'] = Variable<String>(action);
    map['key_string'] = Variable<String>(keyString);
    map['is_enabled'] = Variable<bool>(isEnabled);
    return map;
  }

  KeybindingsCompanion toCompanion(bool nullToAbsent) {
    return KeybindingsCompanion(
      id: Value(id),
      action: Value(action),
      keyString: Value(keyString),
      isEnabled: Value(isEnabled),
    );
  }

  factory Keybinding.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Keybinding(
      id: serializer.fromJson<int>(json['id']),
      action: serializer.fromJson<String>(json['action']),
      keyString: serializer.fromJson<String>(json['keyString']),
      isEnabled: serializer.fromJson<bool>(json['isEnabled']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'action': serializer.toJson<String>(action),
      'keyString': serializer.toJson<String>(keyString),
      'isEnabled': serializer.toJson<bool>(isEnabled),
    };
  }

  Keybinding copyWith(
          {int? id, String? action, String? keyString, bool? isEnabled}) =>
      Keybinding(
        id: id ?? this.id,
        action: action ?? this.action,
        keyString: keyString ?? this.keyString,
        isEnabled: isEnabled ?? this.isEnabled,
      );
  Keybinding copyWithCompanion(KeybindingsCompanion data) {
    return Keybinding(
      id: data.id.present ? data.id.value : this.id,
      action: data.action.present ? data.action.value : this.action,
      keyString: data.keyString.present ? data.keyString.value : this.keyString,
      isEnabled: data.isEnabled.present ? data.isEnabled.value : this.isEnabled,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Keybinding(')
          ..write('id: $id, ')
          ..write('action: $action, ')
          ..write('keyString: $keyString, ')
          ..write('isEnabled: $isEnabled')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, action, keyString, isEnabled);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Keybinding &&
          other.id == this.id &&
          other.action == this.action &&
          other.keyString == this.keyString &&
          other.isEnabled == this.isEnabled);
}

class KeybindingsCompanion extends UpdateCompanion<Keybinding> {
  final Value<int> id;
  final Value<String> action;
  final Value<String> keyString;
  final Value<bool> isEnabled;
  const KeybindingsCompanion({
    this.id = const Value.absent(),
    this.action = const Value.absent(),
    this.keyString = const Value.absent(),
    this.isEnabled = const Value.absent(),
  });
  KeybindingsCompanion.insert({
    this.id = const Value.absent(),
    required String action,
    required String keyString,
    this.isEnabled = const Value.absent(),
  })  : action = Value(action),
        keyString = Value(keyString);
  static Insertable<Keybinding> custom({
    Expression<int>? id,
    Expression<String>? action,
    Expression<String>? keyString,
    Expression<bool>? isEnabled,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (action != null) 'action': action,
      if (keyString != null) 'key_string': keyString,
      if (isEnabled != null) 'is_enabled': isEnabled,
    });
  }

  KeybindingsCompanion copyWith(
      {Value<int>? id,
      Value<String>? action,
      Value<String>? keyString,
      Value<bool>? isEnabled}) {
    return KeybindingsCompanion(
      id: id ?? this.id,
      action: action ?? this.action,
      keyString: keyString ?? this.keyString,
      isEnabled: isEnabled ?? this.isEnabled,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (action.present) {
      map['action'] = Variable<String>(action.value);
    }
    if (keyString.present) {
      map['key_string'] = Variable<String>(keyString.value);
    }
    if (isEnabled.present) {
      map['is_enabled'] = Variable<bool>(isEnabled.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('KeybindingsCompanion(')
          ..write('id: $id, ')
          ..write('action: $action, ')
          ..write('keyString: $keyString, ')
          ..write('isEnabled: $isEnabled')
          ..write(')'))
        .toString();
  }
}

class $ProfilesTable extends Profiles with TableInfo<$ProfilesTable, Profile> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $ProfilesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
      'name', aliasedName, false,
      additionalChecks:
          GeneratedColumn.checkTextLength(minTextLength: 1, maxTextLength: 50),
      type: DriftSqlType.string,
      requiredDuringInsert: true);
  static const VerificationMeta _mcVersionMeta =
      const VerificationMeta('mcVersion');
  @override
  late final GeneratedColumn<String> mcVersion = GeneratedColumn<String>(
      'mc_version', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('1.21.1'));
  static const VerificationMeta _neoForgeVersionMeta =
      const VerificationMeta('neoForgeVersion');
  @override
  late final GeneratedColumn<String> neoForgeVersion = GeneratedColumn<String>(
      'neo_forge_version', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _gameDirMeta =
      const VerificationMeta('gameDir');
  @override
  late final GeneratedColumn<String> gameDir = GeneratedColumn<String>(
      'game_dir', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _minRamMeta = const VerificationMeta('minRam');
  @override
  late final GeneratedColumn<int> minRam = GeneratedColumn<int>(
      'min_ram', aliasedName, true,
      type: DriftSqlType.int, requiredDuringInsert: false);
  static const VerificationMeta _maxRamMeta = const VerificationMeta('maxRam');
  @override
  late final GeneratedColumn<int> maxRam = GeneratedColumn<int>(
      'max_ram', aliasedName, true,
      type: DriftSqlType.int, requiredDuringInsert: false);
  static const VerificationMeta _javaArgsMeta =
      const VerificationMeta('javaArgs');
  @override
  late final GeneratedColumn<String> javaArgs = GeneratedColumn<String>(
      'java_args', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _javaPathMeta =
      const VerificationMeta('javaPath');
  @override
  late final GeneratedColumn<String> javaPath = GeneratedColumn<String>(
      'java_path', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _createdMeta =
      const VerificationMeta('created');
  @override
  late final GeneratedColumn<DateTime> created = GeneratedColumn<DateTime>(
      'created', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  static const VerificationMeta _lastUsedMeta =
      const VerificationMeta('lastUsed');
  @override
  late final GeneratedColumn<DateTime> lastUsed = GeneratedColumn<DateTime>(
      'last_used', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        name,
        mcVersion,
        neoForgeVersion,
        gameDir,
        minRam,
        maxRam,
        javaArgs,
        javaPath,
        created,
        lastUsed
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'profiles';
  @override
  VerificationContext validateIntegrity(Insertable<Profile> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('name')) {
      context.handle(
          _nameMeta, name.isAcceptableOrUnknown(data['name']!, _nameMeta));
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('mc_version')) {
      context.handle(_mcVersionMeta,
          mcVersion.isAcceptableOrUnknown(data['mc_version']!, _mcVersionMeta));
    }
    if (data.containsKey('neo_forge_version')) {
      context.handle(
          _neoForgeVersionMeta,
          neoForgeVersion.isAcceptableOrUnknown(
              data['neo_forge_version']!, _neoForgeVersionMeta));
    }
    if (data.containsKey('game_dir')) {
      context.handle(_gameDirMeta,
          gameDir.isAcceptableOrUnknown(data['game_dir']!, _gameDirMeta));
    }
    if (data.containsKey('min_ram')) {
      context.handle(_minRamMeta,
          minRam.isAcceptableOrUnknown(data['min_ram']!, _minRamMeta));
    }
    if (data.containsKey('max_ram')) {
      context.handle(_maxRamMeta,
          maxRam.isAcceptableOrUnknown(data['max_ram']!, _maxRamMeta));
    }
    if (data.containsKey('java_args')) {
      context.handle(_javaArgsMeta,
          javaArgs.isAcceptableOrUnknown(data['java_args']!, _javaArgsMeta));
    }
    if (data.containsKey('java_path')) {
      context.handle(_javaPathMeta,
          javaPath.isAcceptableOrUnknown(data['java_path']!, _javaPathMeta));
    }
    if (data.containsKey('created')) {
      context.handle(_createdMeta,
          created.isAcceptableOrUnknown(data['created']!, _createdMeta));
    }
    if (data.containsKey('last_used')) {
      context.handle(_lastUsedMeta,
          lastUsed.isAcceptableOrUnknown(data['last_used']!, _lastUsedMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Profile map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Profile(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      name: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}name'])!,
      mcVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}mc_version'])!,
      neoForgeVersion: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}neo_forge_version']),
      gameDir: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}game_dir']),
      minRam: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}min_ram']),
      maxRam: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}max_ram']),
      javaArgs: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}java_args']),
      javaPath: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}java_path']),
      created: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created'])!,
      lastUsed: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}last_used']),
    );
  }

  @override
  $ProfilesTable createAlias(String alias) {
    return $ProfilesTable(attachedDatabase, alias);
  }
}

class Profile extends DataClass implements Insertable<Profile> {
  final int id;
  final String name;
  final String mcVersion;
  final String? neoForgeVersion;
  final String? gameDir;
  final int? minRam;
  final int? maxRam;
  final String? javaArgs;
  final String? javaPath;
  final DateTime created;
  final DateTime? lastUsed;
  const Profile(
      {required this.id,
      required this.name,
      required this.mcVersion,
      this.neoForgeVersion,
      this.gameDir,
      this.minRam,
      this.maxRam,
      this.javaArgs,
      this.javaPath,
      required this.created,
      this.lastUsed});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['name'] = Variable<String>(name);
    map['mc_version'] = Variable<String>(mcVersion);
    if (!nullToAbsent || neoForgeVersion != null) {
      map['neo_forge_version'] = Variable<String>(neoForgeVersion);
    }
    if (!nullToAbsent || gameDir != null) {
      map['game_dir'] = Variable<String>(gameDir);
    }
    if (!nullToAbsent || minRam != null) {
      map['min_ram'] = Variable<int>(minRam);
    }
    if (!nullToAbsent || maxRam != null) {
      map['max_ram'] = Variable<int>(maxRam);
    }
    if (!nullToAbsent || javaArgs != null) {
      map['java_args'] = Variable<String>(javaArgs);
    }
    if (!nullToAbsent || javaPath != null) {
      map['java_path'] = Variable<String>(javaPath);
    }
    map['created'] = Variable<DateTime>(created);
    if (!nullToAbsent || lastUsed != null) {
      map['last_used'] = Variable<DateTime>(lastUsed);
    }
    return map;
  }

  ProfilesCompanion toCompanion(bool nullToAbsent) {
    return ProfilesCompanion(
      id: Value(id),
      name: Value(name),
      mcVersion: Value(mcVersion),
      neoForgeVersion: neoForgeVersion == null && nullToAbsent
          ? const Value.absent()
          : Value(neoForgeVersion),
      gameDir: gameDir == null && nullToAbsent
          ? const Value.absent()
          : Value(gameDir),
      minRam:
          minRam == null && nullToAbsent ? const Value.absent() : Value(minRam),
      maxRam:
          maxRam == null && nullToAbsent ? const Value.absent() : Value(maxRam),
      javaArgs: javaArgs == null && nullToAbsent
          ? const Value.absent()
          : Value(javaArgs),
      javaPath: javaPath == null && nullToAbsent
          ? const Value.absent()
          : Value(javaPath),
      created: Value(created),
      lastUsed: lastUsed == null && nullToAbsent
          ? const Value.absent()
          : Value(lastUsed),
    );
  }

  factory Profile.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Profile(
      id: serializer.fromJson<int>(json['id']),
      name: serializer.fromJson<String>(json['name']),
      mcVersion: serializer.fromJson<String>(json['mcVersion']),
      neoForgeVersion: serializer.fromJson<String?>(json['neoForgeVersion']),
      gameDir: serializer.fromJson<String?>(json['gameDir']),
      minRam: serializer.fromJson<int?>(json['minRam']),
      maxRam: serializer.fromJson<int?>(json['maxRam']),
      javaArgs: serializer.fromJson<String?>(json['javaArgs']),
      javaPath: serializer.fromJson<String?>(json['javaPath']),
      created: serializer.fromJson<DateTime>(json['created']),
      lastUsed: serializer.fromJson<DateTime?>(json['lastUsed']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'name': serializer.toJson<String>(name),
      'mcVersion': serializer.toJson<String>(mcVersion),
      'neoForgeVersion': serializer.toJson<String?>(neoForgeVersion),
      'gameDir': serializer.toJson<String?>(gameDir),
      'minRam': serializer.toJson<int?>(minRam),
      'maxRam': serializer.toJson<int?>(maxRam),
      'javaArgs': serializer.toJson<String?>(javaArgs),
      'javaPath': serializer.toJson<String?>(javaPath),
      'created': serializer.toJson<DateTime>(created),
      'lastUsed': serializer.toJson<DateTime?>(lastUsed),
    };
  }

  Profile copyWith(
          {int? id,
          String? name,
          String? mcVersion,
          Value<String?> neoForgeVersion = const Value.absent(),
          Value<String?> gameDir = const Value.absent(),
          Value<int?> minRam = const Value.absent(),
          Value<int?> maxRam = const Value.absent(),
          Value<String?> javaArgs = const Value.absent(),
          Value<String?> javaPath = const Value.absent(),
          DateTime? created,
          Value<DateTime?> lastUsed = const Value.absent()}) =>
      Profile(
        id: id ?? this.id,
        name: name ?? this.name,
        mcVersion: mcVersion ?? this.mcVersion,
        neoForgeVersion: neoForgeVersion.present
            ? neoForgeVersion.value
            : this.neoForgeVersion,
        gameDir: gameDir.present ? gameDir.value : this.gameDir,
        minRam: minRam.present ? minRam.value : this.minRam,
        maxRam: maxRam.present ? maxRam.value : this.maxRam,
        javaArgs: javaArgs.present ? javaArgs.value : this.javaArgs,
        javaPath: javaPath.present ? javaPath.value : this.javaPath,
        created: created ?? this.created,
        lastUsed: lastUsed.present ? lastUsed.value : this.lastUsed,
      );
  Profile copyWithCompanion(ProfilesCompanion data) {
    return Profile(
      id: data.id.present ? data.id.value : this.id,
      name: data.name.present ? data.name.value : this.name,
      mcVersion: data.mcVersion.present ? data.mcVersion.value : this.mcVersion,
      neoForgeVersion: data.neoForgeVersion.present
          ? data.neoForgeVersion.value
          : this.neoForgeVersion,
      gameDir: data.gameDir.present ? data.gameDir.value : this.gameDir,
      minRam: data.minRam.present ? data.minRam.value : this.minRam,
      maxRam: data.maxRam.present ? data.maxRam.value : this.maxRam,
      javaArgs: data.javaArgs.present ? data.javaArgs.value : this.javaArgs,
      javaPath: data.javaPath.present ? data.javaPath.value : this.javaPath,
      created: data.created.present ? data.created.value : this.created,
      lastUsed: data.lastUsed.present ? data.lastUsed.value : this.lastUsed,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Profile(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('mcVersion: $mcVersion, ')
          ..write('neoForgeVersion: $neoForgeVersion, ')
          ..write('gameDir: $gameDir, ')
          ..write('minRam: $minRam, ')
          ..write('maxRam: $maxRam, ')
          ..write('javaArgs: $javaArgs, ')
          ..write('javaPath: $javaPath, ')
          ..write('created: $created, ')
          ..write('lastUsed: $lastUsed')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, name, mcVersion, neoForgeVersion, gameDir,
      minRam, maxRam, javaArgs, javaPath, created, lastUsed);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Profile &&
          other.id == this.id &&
          other.name == this.name &&
          other.mcVersion == this.mcVersion &&
          other.neoForgeVersion == this.neoForgeVersion &&
          other.gameDir == this.gameDir &&
          other.minRam == this.minRam &&
          other.maxRam == this.maxRam &&
          other.javaArgs == this.javaArgs &&
          other.javaPath == this.javaPath &&
          other.created == this.created &&
          other.lastUsed == this.lastUsed);
}

class ProfilesCompanion extends UpdateCompanion<Profile> {
  final Value<int> id;
  final Value<String> name;
  final Value<String> mcVersion;
  final Value<String?> neoForgeVersion;
  final Value<String?> gameDir;
  final Value<int?> minRam;
  final Value<int?> maxRam;
  final Value<String?> javaArgs;
  final Value<String?> javaPath;
  final Value<DateTime> created;
  final Value<DateTime?> lastUsed;
  const ProfilesCompanion({
    this.id = const Value.absent(),
    this.name = const Value.absent(),
    this.mcVersion = const Value.absent(),
    this.neoForgeVersion = const Value.absent(),
    this.gameDir = const Value.absent(),
    this.minRam = const Value.absent(),
    this.maxRam = const Value.absent(),
    this.javaArgs = const Value.absent(),
    this.javaPath = const Value.absent(),
    this.created = const Value.absent(),
    this.lastUsed = const Value.absent(),
  });
  ProfilesCompanion.insert({
    this.id = const Value.absent(),
    required String name,
    this.mcVersion = const Value.absent(),
    this.neoForgeVersion = const Value.absent(),
    this.gameDir = const Value.absent(),
    this.minRam = const Value.absent(),
    this.maxRam = const Value.absent(),
    this.javaArgs = const Value.absent(),
    this.javaPath = const Value.absent(),
    this.created = const Value.absent(),
    this.lastUsed = const Value.absent(),
  }) : name = Value(name);
  static Insertable<Profile> custom({
    Expression<int>? id,
    Expression<String>? name,
    Expression<String>? mcVersion,
    Expression<String>? neoForgeVersion,
    Expression<String>? gameDir,
    Expression<int>? minRam,
    Expression<int>? maxRam,
    Expression<String>? javaArgs,
    Expression<String>? javaPath,
    Expression<DateTime>? created,
    Expression<DateTime>? lastUsed,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (name != null) 'name': name,
      if (mcVersion != null) 'mc_version': mcVersion,
      if (neoForgeVersion != null) 'neo_forge_version': neoForgeVersion,
      if (gameDir != null) 'game_dir': gameDir,
      if (minRam != null) 'min_ram': minRam,
      if (maxRam != null) 'max_ram': maxRam,
      if (javaArgs != null) 'java_args': javaArgs,
      if (javaPath != null) 'java_path': javaPath,
      if (created != null) 'created': created,
      if (lastUsed != null) 'last_used': lastUsed,
    });
  }

  ProfilesCompanion copyWith(
      {Value<int>? id,
      Value<String>? name,
      Value<String>? mcVersion,
      Value<String?>? neoForgeVersion,
      Value<String?>? gameDir,
      Value<int?>? minRam,
      Value<int?>? maxRam,
      Value<String?>? javaArgs,
      Value<String?>? javaPath,
      Value<DateTime>? created,
      Value<DateTime?>? lastUsed}) {
    return ProfilesCompanion(
      id: id ?? this.id,
      name: name ?? this.name,
      mcVersion: mcVersion ?? this.mcVersion,
      neoForgeVersion: neoForgeVersion ?? this.neoForgeVersion,
      gameDir: gameDir ?? this.gameDir,
      minRam: minRam ?? this.minRam,
      maxRam: maxRam ?? this.maxRam,
      javaArgs: javaArgs ?? this.javaArgs,
      javaPath: javaPath ?? this.javaPath,
      created: created ?? this.created,
      lastUsed: lastUsed ?? this.lastUsed,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (mcVersion.present) {
      map['mc_version'] = Variable<String>(mcVersion.value);
    }
    if (neoForgeVersion.present) {
      map['neo_forge_version'] = Variable<String>(neoForgeVersion.value);
    }
    if (gameDir.present) {
      map['game_dir'] = Variable<String>(gameDir.value);
    }
    if (minRam.present) {
      map['min_ram'] = Variable<int>(minRam.value);
    }
    if (maxRam.present) {
      map['max_ram'] = Variable<int>(maxRam.value);
    }
    if (javaArgs.present) {
      map['java_args'] = Variable<String>(javaArgs.value);
    }
    if (javaPath.present) {
      map['java_path'] = Variable<String>(javaPath.value);
    }
    if (created.present) {
      map['created'] = Variable<DateTime>(created.value);
    }
    if (lastUsed.present) {
      map['last_used'] = Variable<DateTime>(lastUsed.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('ProfilesCompanion(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('mcVersion: $mcVersion, ')
          ..write('neoForgeVersion: $neoForgeVersion, ')
          ..write('gameDir: $gameDir, ')
          ..write('minRam: $minRam, ')
          ..write('maxRam: $maxRam, ')
          ..write('javaArgs: $javaArgs, ')
          ..write('javaPath: $javaPath, ')
          ..write('created: $created, ')
          ..write('lastUsed: $lastUsed')
          ..write(')'))
        .toString();
  }
}

abstract class _$LocalDatabase extends GeneratedDatabase {
  _$LocalDatabase(QueryExecutor e) : super(e);
  $LocalDatabaseManager get managers => $LocalDatabaseManager(this);
  late final $SettingsTable settings = $SettingsTable(this);
  late final $KeybindingsTable keybindings = $KeybindingsTable(this);
  late final $ProfilesTable profiles = $ProfilesTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities =>
      [settings, keybindings, profiles];
}

typedef $$SettingsTableCreateCompanionBuilder = SettingsCompanion Function({
  Value<int> id,
  Value<int> minRam,
  Value<int> maxRam,
  Value<String?> javaPath,
  Value<int> width,
  Value<int> height,
  Value<bool> fullscreen,
  Value<bool> closeLauncher,
  Value<String> language,
  Value<String?> mcVersion,
  Value<String?> neoForgeVersion,
  Value<bool?> autoConnect,
  Value<int?> selectedProfileId,
});
typedef $$SettingsTableUpdateCompanionBuilder = SettingsCompanion Function({
  Value<int> id,
  Value<int> minRam,
  Value<int> maxRam,
  Value<String?> javaPath,
  Value<int> width,
  Value<int> height,
  Value<bool> fullscreen,
  Value<bool> closeLauncher,
  Value<String> language,
  Value<String?> mcVersion,
  Value<String?> neoForgeVersion,
  Value<bool?> autoConnect,
  Value<int?> selectedProfileId,
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
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get minRam => $composableBuilder(
      column: $table.minRam, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get maxRam => $composableBuilder(
      column: $table.maxRam, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get javaPath => $composableBuilder(
      column: $table.javaPath, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get width => $composableBuilder(
      column: $table.width, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get height => $composableBuilder(
      column: $table.height, builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get fullscreen => $composableBuilder(
      column: $table.fullscreen, builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get closeLauncher => $composableBuilder(
      column: $table.closeLauncher, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get language => $composableBuilder(
      column: $table.language, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get mcVersion => $composableBuilder(
      column: $table.mcVersion, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get neoForgeVersion => $composableBuilder(
      column: $table.neoForgeVersion,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get autoConnect => $composableBuilder(
      column: $table.autoConnect, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get selectedProfileId => $composableBuilder(
      column: $table.selectedProfileId,
      builder: (column) => ColumnFilters(column));
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
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get minRam => $composableBuilder(
      column: $table.minRam, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get maxRam => $composableBuilder(
      column: $table.maxRam, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get javaPath => $composableBuilder(
      column: $table.javaPath, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get width => $composableBuilder(
      column: $table.width, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get height => $composableBuilder(
      column: $table.height, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get fullscreen => $composableBuilder(
      column: $table.fullscreen, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get closeLauncher => $composableBuilder(
      column: $table.closeLauncher,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get language => $composableBuilder(
      column: $table.language, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get mcVersion => $composableBuilder(
      column: $table.mcVersion, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get neoForgeVersion => $composableBuilder(
      column: $table.neoForgeVersion,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get autoConnect => $composableBuilder(
      column: $table.autoConnect, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get selectedProfileId => $composableBuilder(
      column: $table.selectedProfileId,
      builder: (column) => ColumnOrderings(column));
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
      column: $table.fullscreen, builder: (column) => column);

  GeneratedColumn<bool> get closeLauncher => $composableBuilder(
      column: $table.closeLauncher, builder: (column) => column);

  GeneratedColumn<String> get language =>
      $composableBuilder(column: $table.language, builder: (column) => column);

  GeneratedColumn<String> get mcVersion =>
      $composableBuilder(column: $table.mcVersion, builder: (column) => column);

  GeneratedColumn<String> get neoForgeVersion => $composableBuilder(
      column: $table.neoForgeVersion, builder: (column) => column);

  GeneratedColumn<bool> get autoConnect => $composableBuilder(
      column: $table.autoConnect, builder: (column) => column);

  GeneratedColumn<int> get selectedProfileId => $composableBuilder(
      column: $table.selectedProfileId, builder: (column) => column);
}

class $$SettingsTableTableManager extends RootTableManager<
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
    PrefetchHooks Function()> {
  $$SettingsTableTableManager(_$LocalDatabase db, $SettingsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SettingsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SettingsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SettingsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<int> minRam = const Value.absent(),
            Value<int> maxRam = const Value.absent(),
            Value<String?> javaPath = const Value.absent(),
            Value<int> width = const Value.absent(),
            Value<int> height = const Value.absent(),
            Value<bool> fullscreen = const Value.absent(),
            Value<bool> closeLauncher = const Value.absent(),
            Value<String> language = const Value.absent(),
            Value<String?> mcVersion = const Value.absent(),
            Value<String?> neoForgeVersion = const Value.absent(),
            Value<bool?> autoConnect = const Value.absent(),
            Value<int?> selectedProfileId = const Value.absent(),
          }) =>
              SettingsCompanion(
            id: id,
            minRam: minRam,
            maxRam: maxRam,
            javaPath: javaPath,
            width: width,
            height: height,
            fullscreen: fullscreen,
            closeLauncher: closeLauncher,
            language: language,
            mcVersion: mcVersion,
            neoForgeVersion: neoForgeVersion,
            autoConnect: autoConnect,
            selectedProfileId: selectedProfileId,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<int> minRam = const Value.absent(),
            Value<int> maxRam = const Value.absent(),
            Value<String?> javaPath = const Value.absent(),
            Value<int> width = const Value.absent(),
            Value<int> height = const Value.absent(),
            Value<bool> fullscreen = const Value.absent(),
            Value<bool> closeLauncher = const Value.absent(),
            Value<String> language = const Value.absent(),
            Value<String?> mcVersion = const Value.absent(),
            Value<String?> neoForgeVersion = const Value.absent(),
            Value<bool?> autoConnect = const Value.absent(),
            Value<int?> selectedProfileId = const Value.absent(),
          }) =>
              SettingsCompanion.insert(
            id: id,
            minRam: minRam,
            maxRam: maxRam,
            javaPath: javaPath,
            width: width,
            height: height,
            fullscreen: fullscreen,
            closeLauncher: closeLauncher,
            language: language,
            mcVersion: mcVersion,
            neoForgeVersion: neoForgeVersion,
            autoConnect: autoConnect,
            selectedProfileId: selectedProfileId,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$SettingsTableProcessedTableManager = ProcessedTableManager<
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
    PrefetchHooks Function()>;
typedef $$KeybindingsTableCreateCompanionBuilder = KeybindingsCompanion
    Function({
  Value<int> id,
  required String action,
  required String keyString,
  Value<bool> isEnabled,
});
typedef $$KeybindingsTableUpdateCompanionBuilder = KeybindingsCompanion
    Function({
  Value<int> id,
  Value<String> action,
  Value<String> keyString,
  Value<bool> isEnabled,
});

class $$KeybindingsTableFilterComposer
    extends Composer<_$LocalDatabase, $KeybindingsTable> {
  $$KeybindingsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get action => $composableBuilder(
      column: $table.action, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get keyString => $composableBuilder(
      column: $table.keyString, builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get isEnabled => $composableBuilder(
      column: $table.isEnabled, builder: (column) => ColumnFilters(column));
}

class $$KeybindingsTableOrderingComposer
    extends Composer<_$LocalDatabase, $KeybindingsTable> {
  $$KeybindingsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get action => $composableBuilder(
      column: $table.action, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get keyString => $composableBuilder(
      column: $table.keyString, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get isEnabled => $composableBuilder(
      column: $table.isEnabled, builder: (column) => ColumnOrderings(column));
}

class $$KeybindingsTableAnnotationComposer
    extends Composer<_$LocalDatabase, $KeybindingsTable> {
  $$KeybindingsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get action =>
      $composableBuilder(column: $table.action, builder: (column) => column);

  GeneratedColumn<String> get keyString =>
      $composableBuilder(column: $table.keyString, builder: (column) => column);

  GeneratedColumn<bool> get isEnabled =>
      $composableBuilder(column: $table.isEnabled, builder: (column) => column);
}

class $$KeybindingsTableTableManager extends RootTableManager<
    _$LocalDatabase,
    $KeybindingsTable,
    Keybinding,
    $$KeybindingsTableFilterComposer,
    $$KeybindingsTableOrderingComposer,
    $$KeybindingsTableAnnotationComposer,
    $$KeybindingsTableCreateCompanionBuilder,
    $$KeybindingsTableUpdateCompanionBuilder,
    (
      Keybinding,
      BaseReferences<_$LocalDatabase, $KeybindingsTable, Keybinding>
    ),
    Keybinding,
    PrefetchHooks Function()> {
  $$KeybindingsTableTableManager(_$LocalDatabase db, $KeybindingsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$KeybindingsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$KeybindingsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$KeybindingsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<String> action = const Value.absent(),
            Value<String> keyString = const Value.absent(),
            Value<bool> isEnabled = const Value.absent(),
          }) =>
              KeybindingsCompanion(
            id: id,
            action: action,
            keyString: keyString,
            isEnabled: isEnabled,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required String action,
            required String keyString,
            Value<bool> isEnabled = const Value.absent(),
          }) =>
              KeybindingsCompanion.insert(
            id: id,
            action: action,
            keyString: keyString,
            isEnabled: isEnabled,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$KeybindingsTableProcessedTableManager = ProcessedTableManager<
    _$LocalDatabase,
    $KeybindingsTable,
    Keybinding,
    $$KeybindingsTableFilterComposer,
    $$KeybindingsTableOrderingComposer,
    $$KeybindingsTableAnnotationComposer,
    $$KeybindingsTableCreateCompanionBuilder,
    $$KeybindingsTableUpdateCompanionBuilder,
    (
      Keybinding,
      BaseReferences<_$LocalDatabase, $KeybindingsTable, Keybinding>
    ),
    Keybinding,
    PrefetchHooks Function()>;
typedef $$ProfilesTableCreateCompanionBuilder = ProfilesCompanion Function({
  Value<int> id,
  required String name,
  Value<String> mcVersion,
  Value<String?> neoForgeVersion,
  Value<String?> gameDir,
  Value<int?> minRam,
  Value<int?> maxRam,
  Value<String?> javaArgs,
  Value<String?> javaPath,
  Value<DateTime> created,
  Value<DateTime?> lastUsed,
});
typedef $$ProfilesTableUpdateCompanionBuilder = ProfilesCompanion Function({
  Value<int> id,
  Value<String> name,
  Value<String> mcVersion,
  Value<String?> neoForgeVersion,
  Value<String?> gameDir,
  Value<int?> minRam,
  Value<int?> maxRam,
  Value<String?> javaArgs,
  Value<String?> javaPath,
  Value<DateTime> created,
  Value<DateTime?> lastUsed,
});

class $$ProfilesTableFilterComposer
    extends Composer<_$LocalDatabase, $ProfilesTable> {
  $$ProfilesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get mcVersion => $composableBuilder(
      column: $table.mcVersion, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get neoForgeVersion => $composableBuilder(
      column: $table.neoForgeVersion,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get gameDir => $composableBuilder(
      column: $table.gameDir, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get minRam => $composableBuilder(
      column: $table.minRam, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get maxRam => $composableBuilder(
      column: $table.maxRam, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get javaArgs => $composableBuilder(
      column: $table.javaArgs, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get javaPath => $composableBuilder(
      column: $table.javaPath, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get created => $composableBuilder(
      column: $table.created, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get lastUsed => $composableBuilder(
      column: $table.lastUsed, builder: (column) => ColumnFilters(column));
}

class $$ProfilesTableOrderingComposer
    extends Composer<_$LocalDatabase, $ProfilesTable> {
  $$ProfilesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get mcVersion => $composableBuilder(
      column: $table.mcVersion, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get neoForgeVersion => $composableBuilder(
      column: $table.neoForgeVersion,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get gameDir => $composableBuilder(
      column: $table.gameDir, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get minRam => $composableBuilder(
      column: $table.minRam, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get maxRam => $composableBuilder(
      column: $table.maxRam, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get javaArgs => $composableBuilder(
      column: $table.javaArgs, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get javaPath => $composableBuilder(
      column: $table.javaPath, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get created => $composableBuilder(
      column: $table.created, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get lastUsed => $composableBuilder(
      column: $table.lastUsed, builder: (column) => ColumnOrderings(column));
}

class $$ProfilesTableAnnotationComposer
    extends Composer<_$LocalDatabase, $ProfilesTable> {
  $$ProfilesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get mcVersion =>
      $composableBuilder(column: $table.mcVersion, builder: (column) => column);

  GeneratedColumn<String> get neoForgeVersion => $composableBuilder(
      column: $table.neoForgeVersion, builder: (column) => column);

  GeneratedColumn<String> get gameDir =>
      $composableBuilder(column: $table.gameDir, builder: (column) => column);

  GeneratedColumn<int> get minRam =>
      $composableBuilder(column: $table.minRam, builder: (column) => column);

  GeneratedColumn<int> get maxRam =>
      $composableBuilder(column: $table.maxRam, builder: (column) => column);

  GeneratedColumn<String> get javaArgs =>
      $composableBuilder(column: $table.javaArgs, builder: (column) => column);

  GeneratedColumn<String> get javaPath =>
      $composableBuilder(column: $table.javaPath, builder: (column) => column);

  GeneratedColumn<DateTime> get created =>
      $composableBuilder(column: $table.created, builder: (column) => column);

  GeneratedColumn<DateTime> get lastUsed =>
      $composableBuilder(column: $table.lastUsed, builder: (column) => column);
}

class $$ProfilesTableTableManager extends RootTableManager<
    _$LocalDatabase,
    $ProfilesTable,
    Profile,
    $$ProfilesTableFilterComposer,
    $$ProfilesTableOrderingComposer,
    $$ProfilesTableAnnotationComposer,
    $$ProfilesTableCreateCompanionBuilder,
    $$ProfilesTableUpdateCompanionBuilder,
    (Profile, BaseReferences<_$LocalDatabase, $ProfilesTable, Profile>),
    Profile,
    PrefetchHooks Function()> {
  $$ProfilesTableTableManager(_$LocalDatabase db, $ProfilesTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$ProfilesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$ProfilesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$ProfilesTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<String> name = const Value.absent(),
            Value<String> mcVersion = const Value.absent(),
            Value<String?> neoForgeVersion = const Value.absent(),
            Value<String?> gameDir = const Value.absent(),
            Value<int?> minRam = const Value.absent(),
            Value<int?> maxRam = const Value.absent(),
            Value<String?> javaArgs = const Value.absent(),
            Value<String?> javaPath = const Value.absent(),
            Value<DateTime> created = const Value.absent(),
            Value<DateTime?> lastUsed = const Value.absent(),
          }) =>
              ProfilesCompanion(
            id: id,
            name: name,
            mcVersion: mcVersion,
            neoForgeVersion: neoForgeVersion,
            gameDir: gameDir,
            minRam: minRam,
            maxRam: maxRam,
            javaArgs: javaArgs,
            javaPath: javaPath,
            created: created,
            lastUsed: lastUsed,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required String name,
            Value<String> mcVersion = const Value.absent(),
            Value<String?> neoForgeVersion = const Value.absent(),
            Value<String?> gameDir = const Value.absent(),
            Value<int?> minRam = const Value.absent(),
            Value<int?> maxRam = const Value.absent(),
            Value<String?> javaArgs = const Value.absent(),
            Value<String?> javaPath = const Value.absent(),
            Value<DateTime> created = const Value.absent(),
            Value<DateTime?> lastUsed = const Value.absent(),
          }) =>
              ProfilesCompanion.insert(
            id: id,
            name: name,
            mcVersion: mcVersion,
            neoForgeVersion: neoForgeVersion,
            gameDir: gameDir,
            minRam: minRam,
            maxRam: maxRam,
            javaArgs: javaArgs,
            javaPath: javaPath,
            created: created,
            lastUsed: lastUsed,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$ProfilesTableProcessedTableManager = ProcessedTableManager<
    _$LocalDatabase,
    $ProfilesTable,
    Profile,
    $$ProfilesTableFilterComposer,
    $$ProfilesTableOrderingComposer,
    $$ProfilesTableAnnotationComposer,
    $$ProfilesTableCreateCompanionBuilder,
    $$ProfilesTableUpdateCompanionBuilder,
    (Profile, BaseReferences<_$LocalDatabase, $ProfilesTable, Profile>),
    Profile,
    PrefetchHooks Function()>;

class $LocalDatabaseManager {
  final _$LocalDatabase _db;
  $LocalDatabaseManager(this._db);
  $$SettingsTableTableManager get settings =>
      $$SettingsTableTableManager(_db, _db.settings);
  $$KeybindingsTableTableManager get keybindings =>
      $$KeybindingsTableTableManager(_db, _db.keybindings);
  $$ProfilesTableTableManager get profiles =>
      $$ProfilesTableTableManager(_db, _db.profiles);
}
