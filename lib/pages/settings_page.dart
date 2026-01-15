import 'package:flutter/material.dart';
import 'package:drift/drift.dart' as drift;
import '../services/database_service.dart';
import '../data/local_database.dart';
import '../theme/app_theme.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  // RAM
  double _minRam = 1024;
  double _maxRam = 4096;

  // Java
  final TextEditingController _javaPathController = TextEditingController();

  // Resolution
  final TextEditingController _widthController = TextEditingController(
    text: "1280",
  );
  final TextEditingController _heightController = TextEditingController(
    text: "720",
  );
  bool _fullscreen = false;

  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    try {
      final settings = await DatabaseService().getSettings();
      setState(() {
        _minRam = settings.minRam.toDouble();
        _maxRam = settings.maxRam.toDouble();
        _javaPathController.text = settings.javaPath ?? "";
        _widthController.text = settings.width.toString();
        _heightController.text = settings.height.toString();
        _fullscreen = settings.fullscreen;
      });
    } catch (e) {
      debugPrint("Error loading settings: $e");
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _saveSettings() async {
    try {
      final companion = SettingsCompanion(
        minRam: drift.Value(_minRam.toInt()),
        maxRam: drift.Value(_maxRam.toInt()),
        javaPath: drift.Value(_javaPathController.text),
        width: drift.Value(int.tryParse(_widthController.text) ?? 1280),
        height: drift.Value(int.tryParse(_heightController.text) ?? 720),
        fullscreen: drift.Value(_fullscreen),
      );

      await DatabaseService().updateSettings(companion);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Configuración guardada correctamente')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al guardar: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text("Configuración"),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(24),
              children: [
                _buildSectionHeader("Memoria (RAM)", Icons.memory),
                const SizedBox(height: 16),
                _buildRamSlider(),

                const SizedBox(height: 32),

                _buildSectionHeader("Java", Icons.coffee),
                const SizedBox(height: 16),
                _buildJavaPathPicker(),

                const SizedBox(height: 32),

                _buildSectionHeader("Resolución", Icons.aspect_ratio),
                const SizedBox(height: 16),
                _buildResolutionInputs(),

                const SizedBox(height: 48),

                ElevatedButton.icon(
                  onPressed: _saveSettings,
                  icon: const Icon(Icons.save),
                  label: const Text("GUARDAR CAMBIOS"),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 20),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: AppTheme.accent),
        const SizedBox(width: 12),
        Text(
          title.toUpperCase(),
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 14,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
          ),
        ),
        const SizedBox(width: 12),
        const Expanded(child: Divider(color: Colors.white10)),
      ],
    );
  }

  Widget _buildRamSlider() {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              "Min: ${_minRam.toInt()} MB",
              style: const TextStyle(color: Colors.white),
            ),
            Text(
              "Max: ${_maxRam.toInt()} MB",
              style: const TextStyle(color: Colors.white),
            ),
          ],
        ),
        RangeSlider(
          values: RangeValues(_minRam, _maxRam),
          min: 512,
          max: 16384, // 16GB
          divisions: 31,
          labels: RangeLabels("${_minRam.toInt()} MB", "${_maxRam.toInt()} MB"),
          activeColor: AppTheme.accent,
          inactiveColor: Colors.white12,
          onChanged: (RangeValues values) {
            setState(() {
              _minRam = values.start;
              _maxRam = values.end;
            });
          },
        ),
      ],
    );
  }

  Widget _buildJavaPathPicker() {
    return Row(
      children: [
        Expanded(
          child: TextField(
            controller: _javaPathController,
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              hintText: "Ruta de javaw.exe (Automático)",
              hintStyle: const TextStyle(color: Colors.white30),
              filled: true,
              fillColor: Colors.white.withOpacity(0.05),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
        ),
        const SizedBox(width: 8),
        IconButton(
          onPressed: () {
            // Placeholder: File Picker implementation
          },
          icon: const Icon(Icons.folder_open, color: Colors.white70),
          tooltip: "Buscar archivo",
        ),
      ],
    );
  }

  Widget _buildResolutionInputs() {
    return Row(
      children: [
        Expanded(
          child: TextField(
            controller: _widthController,
            style: const TextStyle(color: Colors.white),
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              labelText: "Ancho",
              labelStyle: const TextStyle(color: Colors.white54),
              filled: true,
              fillColor: Colors.white.withOpacity(0.05),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: TextField(
            controller: _heightController,
            style: const TextStyle(color: Colors.white),
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              labelText: "Alto",
              labelStyle: const TextStyle(color: Colors.white54),
              filled: true,
              fillColor: Colors.white.withOpacity(0.05),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Column(
          children: [
            const Text(
              "Fullscreen",
              style: TextStyle(color: Colors.white54, fontSize: 12),
            ),
            Switch(
              value: _fullscreen,
              activeColor: AppTheme.accent,
              onChanged: (val) => setState(() => _fullscreen = val),
            ),
          ],
        ),
      ],
    );
  }
}
