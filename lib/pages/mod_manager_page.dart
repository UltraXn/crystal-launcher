import 'package:flutter/material.dart';
import 'dart:io';
import 'package:file_selector/file_selector.dart';
import 'package:path/path.dart' as p;

import '../../services/mod_service.dart';
import '../../theme/app_theme.dart';
import '../../utils/logger.dart';
import 'package:url_launcher/url_launcher.dart';

// Components
import 'mod_manager/components/sliver_mod_category_section.dart';

class ModManagerPage extends StatefulWidget {
  const ModManagerPage({super.key});

  @override
  State<ModManagerPage> createState() => _ModManagerPageState();
}

class _ModManagerPageState extends State<ModManagerPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<ModItem> _mods = [];
  bool _isLoading = true;
  String? _gameDir;
  String _searchQuery = "";
  final TextEditingController _searchController = TextEditingController();

  // Optimized groups
  List<ModItem> _officialServer = [];
  List<ModItem> _officialClient = [];
  List<ModItem> _officialLib = [];

  List<ModItem> _importedServer = [];
  List<ModItem> _importedClient = [];
  List<ModItem> _importedLib = [];

  bool get _hasOfficial =>
      _officialServer.isNotEmpty ||
      _officialClient.isNotEmpty ||
      _officialLib.isNotEmpty;
  bool get _hasImported =>
      _importedServer.isNotEmpty ||
      _importedClient.isNotEmpty ||
      _importedLib.isNotEmpty;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadMods();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadMods({bool forceRefresh = false}) async {
    setState(() => _isLoading = true);
    try {
      String? home = Platform.environment['USERPROFILE'] ?? Platform.environment['HOME'];
      if (home != null) {
        _gameDir = p.join(home, '.crystaltides');
      } else {
        final appData = Platform.environment['APPDATA'] ?? '.';
        _gameDir = p.join(appData, '.crystaltides');
      }

      _mods = await ModService().getLocalMods(
        _gameDir!,
        forceRefresh: forceRefresh,
      );
      
      // Ensure directory exists
      final modsDir = Directory(p.join(_gameDir!, 'mods'));
      if (!await modsDir.exists()) {
        await modsDir.create(recursive: true);
        logger.i("Carpeta de mods creada: ${modsDir.path}");
      }

      _groupMods();
      _identifyModsInBackground();
    } catch (e) {
      logger.e("Error loading mods", error: e);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _identifyModsInBackground() async {
    for (int i = 0; i < _mods.length; i++) {
      if (!mounted) return;
      final identified = await ModService().identifyModMetadata(_mods[i]);
      if (mounted && identified != _mods[i]) {
        setState(() {
          _mods[i] = identified;
          _groupMods();
        });
      }
    }
  }

  void _groupMods() {
    _officialServer = [];
    _officialClient = [];
    _officialLib = [];
    _importedServer = [];
    _importedClient = [];
    _importedLib = [];

    final filtered = _mods.where((m) {
      if (_searchQuery.isEmpty) return true;
      return m.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          m.fileName.toLowerCase().contains(_searchQuery.toLowerCase());
    }).toList();

    for (final mod in filtered) {
      if (mod.isImported) {
        switch (mod.category) {
          case ModCategory.server: _importedServer.add(mod); break;
          case ModCategory.client: _importedClient.add(mod); break;
          case ModCategory.library: _importedLib.add(mod); break;
        }
      } else {
        switch (mod.category) {
          case ModCategory.server: _officialServer.add(mod); break;
          case ModCategory.client: _officialClient.add(mod); break;
          case ModCategory.library: _officialLib.add(mod); break;
        }
      }
    }
  }

  Future<void> _toggleMod(ModItem mod) async {
    try {
      await ModService().toggleMod(mod);
      final newPath = mod.isEnabled
          ? "${mod.path}.disabled"
          : mod.path.replaceAll('.jar.disabled', '.jar');

      final newMod = mod.copyWith(
        isEnabled: !mod.isEnabled,
        path: newPath,
        fileName: p.basename(newPath),
      );

      if (mounted) {
        setState(() {
          final index = _mods.indexWhere((m) => m.path == mod.path);
          if (index != -1) _mods[index] = newMod;
          _groupMods();
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error: $e"), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _importMods() async {
    try {
      final typeGroup = XTypeGroup(label: 'Minecraft Mods', extensions: ['jar']);
      final files = await openFiles(acceptedTypeGroups: [typeGroup]);
      if (files.isEmpty) return;

      int count = 0;
      int invalid = 0;
      for (final file in files) {
        if (await ModService().isValidMod(File(file.path))) {
          final newPath = p.join(_gameDir!, 'mods', file.name);
          await File(file.path).copy(newPath);
          count++;
        } else {
          invalid++;
        }
      }
      if (mounted) {
        _showImportSummary(count, invalid);
        if (count > 0) await _loadMods(forceRefresh: true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error al importar: $e"), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _openModsFolder() async {
    if (_gameDir == null) return;
    final modsDir = Directory(p.join(_gameDir!, 'mods'));
    if (!await modsDir.exists()) {
      await modsDir.create(recursive: true);
    }
    
    final Uri uri = Uri.file(modsDir.path);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      // Fallback for Windows if URI fails
      if (Platform.isWindows) {
        await Process.run('explorer.exe', [modsDir.path]);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("No se pudo abrir la carpeta")),
          );
        }
      }
    }
  }

  void _showImportSummary(int count, int invalid) {
    String msg = "";
    if (count > 0) msg = "$count mods importados.";
    if (invalid > 0) msg += " $invalid archivos inválidos.";
    if (msg.isNotEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(msg), backgroundColor: count > 0 ? Colors.green : Colors.orange),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: Stack(
        children: [
          // Background Gradient Glow
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.accent.withOpacity(0.05),
              ),
            ),
          ),
          
          SafeArea(
            child: Column(
              children: [
                _buildHeader(),
                _buildSearchAndTabs(),
                Expanded(
                  child: _isLoading
                      ? const Center(child: CircularProgressIndicator())
                      : TabBarView(
                          controller: _tabController,
                          children: [
                            _buildOfficialTab(),
                            _buildImportedTab(),
                            _ExploreModsTab(
                              gameDir: _gameDir ?? "",
                              onInstalled: () => _loadMods(forceRefresh: true),
                            ),
                          ],
                        ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 20),
            onPressed: () => Navigator.pop(context),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
            tooltip: "Volver al Menú Principal",
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Gestor de Mods",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 28,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.5,
                  shadows: [
                    Shadow(
                      color: AppTheme.accent.withOpacity(0.3),
                      blurRadius: 10,
                    )
                  ]
                ),
              ),
              Text(
                "Personaliza tu experiencia de juego",
                style: TextStyle(
                  color: Colors.white.withOpacity(0.4),
                  fontSize: 13,
                ),
              ),
            ],
          ),
          const Spacer(),
          _buildActionButton(Icons.folder_open, "Abrir Carpeta", _openModsFolder),
          const SizedBox(width: 12),
          _buildActionButton(Icons.add_circle_outline, "Importar", _importMods),
          const SizedBox(width: 12),
          _buildActionButton(Icons.refresh, null, () => _loadMods(forceRefresh: true)),
        ],
      ),
    );
  }

  Widget _buildActionButton(IconData icon, String? label, VoidCallback onTap) {
    return Material(
      color: Colors.white.withOpacity(0.05),
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: label != null ? 16 : 12, vertical: 12),
          child: Row(
            children: [
              Icon(icon, color: AppTheme.accent, size: 20),
              if (label != null) ...[
                const SizedBox(width: 8),
                Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSearchAndTabs() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      child: Column(
        children: [
          Container(
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.03),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withOpacity(0.05)),
            ),
            child: TextField(
              controller: _searchController,
              onChanged: (val) => setState(() {
                _searchQuery = val;
                _groupMods();
              }),
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: InputDecoration(
                hintText: "Escribe el nombre de un mod...",
                hintStyle: TextStyle(color: Colors.white.withOpacity(0.2)),
                prefixIcon: Icon(
                  Icons.search,
                  color: Colors.white.withOpacity(0.2),
                  size: 20,
                ),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(vertical: 15),
              ),
            ),
          ),
          const SizedBox(height: 16),
          TabBar(
            controller: _tabController,
            indicatorSize: TabBarIndicatorSize.label,
            dividerColor: Colors.transparent,
            indicator: BoxDecoration(
              borderRadius: BorderRadius.circular(50),
              color: AppTheme.accent.withOpacity(0.1),
            ),
            labelColor: AppTheme.accent,
            unselectedLabelColor: Colors.white.withOpacity(0.3),
            tabs: const [
              Tab(child: Padding(padding: EdgeInsets.symmetric(horizontal: 16), child: Text("OFICIAL"))),
              Tab(child: Padding(padding: EdgeInsets.symmetric(horizontal: 16), child: Text("MIS MODS"))),
              Tab(child: Padding(padding: EdgeInsets.symmetric(horizontal: 16), child: Text("EXPLORAR"))),
            ],
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  Future<void> _restoreOfficialPack() async {
    if (_gameDir == null) return;
    
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1A1A1A),
        title: const Text("Restaurar Pack Oficial", style: TextStyle(color: Colors.white)),
        content: const Text(
          "Esto reemplazará los mods oficiales con la versión más reciente del servidor. Tus mods personales no se verán afectados.",
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text("Cancelar")),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.accent),
            child: const Text("Restaurar ahora", style: TextStyle(color: Colors.black)),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() => _isLoading = true);
    
    // Snackbar persistente para progreso
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Row(
            children: [
              SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)),
              SizedBox(width: 16),
              Expanded(child: Text("Sincronizando mods oficiales... por favor espera.")),
            ],
          ),
          duration: Duration(minutes: 10),
        ),
      );
    }

    try {
      await ModService().syncOfficialMods(
        _gameDir!,
        onProgress: (name, p) {
          if (p > 0 && p < 1) {
             // Opcional: Podrías actualizar el mensaje del snackbar aquí con un State
             logger.d("Sincronizando $name: ${(p * 100).toStringAsFixed(0)}%");
          }
        },
      );
      
      if (mounted) {
        ScaffoldMessenger.of(context).hideCurrentSnackBar();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("¡Mods sincronizados con éxito!"), backgroundColor: Colors.green),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).hideCurrentSnackBar();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error de sincronización: $e"), backgroundColor: Colors.red, duration: const Duration(seconds: 10)),
        );
      }
    } finally {
      await _loadMods(forceRefresh: true);
    }
  }

  Widget _buildOfficialTab() {
    if (!_hasOfficial) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.auto_awesome,
              size: 64,
              color: AppTheme.accent.withOpacity(0.2),
            ),
            const SizedBox(height: 16),
            const Text("No hay mods oficiales instalados", style: TextStyle(color: Colors.white54)),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _restoreOfficialPack,
              icon: const Icon(Icons.download, size: 18),
              label: const Text("Descargar Pack Base"),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.accent,
                foregroundColor: Colors.black,
              ),
            ),
          ],
        ),
      );
    }
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 16.0),
              child: Row(
                children: [
                  const Text(
                    "Contenido del Servidor",
                    style: TextStyle(
                      color: Colors.white38,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                      letterSpacing: 1,
                    ),
                  ),
                  const Spacer(),
                  TextButton.icon(
                    onPressed: _restoreOfficialPack,
                    icon: const Icon(Icons.restore, size: 16, color: AppTheme.accent),
                    label: const Text("Restaurar Pack", style: TextStyle(color: AppTheme.accent, fontSize: 11)),
                  ),
                ],
              ),
            ),
          ),
          if (_officialServer.isNotEmpty)
            SliverModCategorySection(title: "Contenido", icon: Icons.sports_esports, items: _officialServer, onToggleMod: _toggleMod, initiallyExpanded: true),
          if (_officialClient.isNotEmpty)
            SliverModCategorySection(title: "Mejoras Visuales", icon: Icons.auto_awesome, items: _officialClient, onToggleMod: _toggleMod),
          if (_officialLib.isNotEmpty)
            SliverModCategorySection(title: "Librerías", icon: Icons.folder, items: _officialLib, onToggleMod: _toggleMod),
          const SliverToBoxAdapter(child: SizedBox(height: 40)),
        ],
      ),
    );
  }

  Widget _buildImportedTab() {
    if (!_hasImported) return _buildEmptyState("Carpeta de mods vacía.");
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: CustomScrollView(
        slivers: [
          if (_importedServer.isNotEmpty)
            SliverModCategorySection(title: "Contenido Extra", icon: Icons.extension, items: _importedServer, onToggleMod: _toggleMod, initiallyExpanded: true),
          if (_importedClient.isNotEmpty)
            SliverModCategorySection(title: "Visual & UI", icon: Icons.palette, items: _importedClient, onToggleMod: _toggleMod),
          if (_importedLib.isNotEmpty)
            SliverModCategorySection(title: "Dependencias", icon: Icons.settings_input_component, items: _importedLib, onToggleMod: _toggleMod),
          const SliverToBoxAdapter(child: SizedBox(height: 40)),
        ],
      ),
    );
  }

  Widget _buildEmptyState(String message) {
    return Center(
      child: Opacity(
        opacity: 0.5,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.layers_clear,
              size: 64,
              color: AppTheme.accent.withOpacity(0.2),
            ),
            const SizedBox(height: 16),
            Text(message, style: const TextStyle(color: Colors.white38, fontSize: 16)),
          ],
        ),
      ),
    );
  }
}

class _ExploreModsTab extends StatefulWidget {
  final String gameDir;
  final VoidCallback onInstalled;
  const _ExploreModsTab({required this.gameDir, required this.onInstalled});

  @override
  State<_ExploreModsTab> createState() => _ExploreModsTabState();
}

class _ExploreModsTabState extends State<_ExploreModsTab> {
  final TextEditingController _exploreController = TextEditingController();
  List<Map<String, dynamic>> _results = [];
  bool _isSearching = false;
  String _selectedVersion = "1.20.1";
  String? _selectedCategory;

  final List<String> _versions = ["1.21.x", "1.20.1", "1.19.2", "1.18.2", "1.16.5"];
  final Map<String, String> _categories = {
    "Optimización": "optimization",
    "Decoración": "decoration",
    "Aventura": "adventure",
    "Magia": "magic",
    "Tecnología": "technology",
    "Utilidad": "utility",
    "Mundo": "worldgen",
  };

  Future<void> _search(String query) async {
    setState(() => _isSearching = true);
    final results = await ModService().searchRemoteMods(
      query,
      category: _selectedCategory,
      gameVersion: _selectedVersion == "1.21.x" ? "1.21" : _selectedVersion,
    );
    setState(() {
      _results = results;
      _isSearching = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          _buildFilters(),
          const SizedBox(height: 16),
          Expanded(
            child: _isSearching
                ? const Center(child: CircularProgressIndicator())
                : _results.isEmpty
                    ? _buildEmptySearch()
                    : ListView.builder(
                        itemCount: _results.length,
                        padding: const EdgeInsets.only(bottom: 40),
                        itemBuilder: (context, index) {
                          final mod = _results[index];
                          return _buildExploreCard(mod);
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilters() {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.03),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: TextField(
                  controller: _exploreController,
                  onSubmitted: _search,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  decoration: InputDecoration(
                    hintText: "Buscar en Modrinth...",
                    hintStyle: TextStyle(color: Colors.white.withOpacity(0.2)),
                    prefixIcon: Icon(
                      Icons.public,
                      color: AppTheme.accent.withOpacity(0.5),
                      size: 18,
                    ),
                    border: InputBorder.none,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            _buildVersionDropdown(),
          ],
        ),
        const SizedBox(height: 12),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _buildCategoryChip("Todos", null),
              ..._categories.entries.map((e) => _buildCategoryChip(e.key, e.value)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildVersionDropdown() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: AppTheme.accent.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.accent.withOpacity(0.2)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: _selectedVersion,
          dropdownColor: AppTheme.background,
          style: const TextStyle(color: AppTheme.accent, fontSize: 12, fontWeight: FontWeight.bold),
          icon: const Icon(Icons.expand_more, color: AppTheme.accent, size: 18),
          items: _versions.map((v) => DropdownMenuItem(value: v, child: Text(v))).toList(),
          onChanged: (val) {
            if (val != null) {
              setState(() => _selectedVersion = val);
              _search(_exploreController.text);
            }
          },
        ),
      ),
    );
  }

  Widget _buildCategoryChip(String label, String? value) {
    bool isSelected = _selectedCategory == value;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (selected) {
          setState(() => _selectedCategory = selected ? value : null);
          _search(_exploreController.text);
        },
        labelStyle: TextStyle(
          color: isSelected ? AppTheme.background : Colors.white60,
          fontSize: 11,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
        selectedColor: AppTheme.accent,
        backgroundColor: Colors.white.withOpacity(0.05),
        showCheckmark: false,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8), side: BorderSide.none),
      ),
    );
  }

  Widget _buildExploreCard(Map<String, dynamic> mod) {
    final cats = List<String>.from(mod['categories'] ?? [])
        .where((c) => c != 'fabric' && c != 'quilt' && c != 'minecraft')
        .take(3)
        .toList();

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: mod['icon_url'] != null
                  ? Image.network(mod['icon_url'], width: 48, height: 48, fit: BoxFit.cover)
                  : Container(width: 48, height: 48, color: Colors.white10, child: const Icon(Icons.image_not_supported)),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(mod['title'] ?? "Mod", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                  Text(mod['description'] ?? "", maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white38, fontSize: 12)),
                  if (cats.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 4,
                      children: cats.map((c) => Text(c.toUpperCase(), style: const TextStyle(color: AppTheme.accent, fontSize: 9, fontWeight: FontWeight.bold))).toList(),
                    ),
                  ],
                ],
              ),
            ),
            _buildInstallButton(mod),
          ],
        ),
      ),
    );
  }

  Widget _buildInstallButton(Map<String, dynamic> mod) {
    return ElevatedButton(
      onPressed: () => _install(mod['project_id'], mod['title']),
      style: ElevatedButton.styleFrom(
        backgroundColor: AppTheme.accent,
        foregroundColor: AppTheme.background,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        minimumSize: Size.zero,
        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
      child: const Text("INSTALAR", style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900)),
    );
  }

  Future<void> _install(String projectId, String title) async {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Descargando $title...")));
    final success = await ModService().installRemoteMod(projectId, widget.gameDir, gameVersion: _selectedVersion);
    if (success) {
      widget.onInstalled();
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Instalación completada"), backgroundColor: Colors.green));
    }
  }

  Widget _buildEmptySearch() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.search_off,
            size: 48,
            color: Colors.white.withOpacity(0.1),
          ),
          const SizedBox(height: 12),
          const Text("Busca mods geniales para añadir", style: TextStyle(color: Colors.white24, fontSize: 14)),
        ],
      ),
    );
  }
}
