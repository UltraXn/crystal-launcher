import 'package:flutter/material.dart';
import 'package:file_selector/file_selector.dart';
import '../../theme/app_theme.dart';

class ProfileEditorDialog extends StatefulWidget {
  final String? initialName;
  final String? initialMcVersion;
  final String? initialNeoForgeVersion;
  final String? initialGameDir;
  final int? initialMinRam;
  final int? initialMaxRam;
  final String? initialJavaArgs;

  const ProfileEditorDialog({
    super.key,
    this.initialName,
    this.initialMcVersion,
    this.initialNeoForgeVersion,
    this.initialGameDir,
    this.initialMinRam,
    this.initialMaxRam,
    this.initialJavaArgs,
  });

  @override
  State<ProfileEditorDialog> createState() => _ProfileEditorDialogState();
}

class _ProfileEditorDialogState extends State<ProfileEditorDialog> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _gameDirController;
  late TextEditingController _javaArgsController;

  String _mcVersion = "1.21.1";
  String _neoForgeVersion = "2.218";
  bool _useCustomRam = false;
  int _minRam = 1024;
  int _maxRam = 4096;

  final Map<String, List<String>> _versionMap = {
    "1.21.1": ["2.218"],
    "1.20.1": ["47.1.0", "47.1.3", "47.1.43"],
    "1.19.4": ["45.1.0", "45.1.32"],
    "1.18.2": ["40.2.0", "40.2.10"],
    "1.16.5": ["36.2.34", "36.2.39"],
  };

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(
      text: widget.initialName ?? "Nuevo Perfil",
    );
    _gameDirController = TextEditingController(
      text: widget.initialGameDir ?? "",
    );
    _javaArgsController = TextEditingController(
      text: widget.initialJavaArgs ?? "",
    );

    _mcVersion = widget.initialMcVersion ?? "1.21.1";
    _neoForgeVersion = widget.initialNeoForgeVersion ?? "2.218";

    if (widget.initialMinRam != null || widget.initialMaxRam != null) {
      _useCustomRam = true;
      _minRam = widget.initialMinRam ?? 1024;
      _maxRam = widget.initialMaxRam ?? 4096;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _gameDirController.dispose();
    _javaArgsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: const Color(0xFF1E1E1E),
      title: const Text("Editar Perfil", style: TextStyle(color: Colors.white)),
      content: SizedBox(
        width: 500,
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Name
                TextFormField(
                  controller: _nameController,
                  style: const TextStyle(color: Colors.white),
                  decoration: _inputDecoration("Nombre del Perfil"),
                  validator: (v) => v == null || v.isEmpty ? "Requerido" : null,
                ),
                const SizedBox(height: 16),

                // Version Selector
                Row(
                  children: [
                    Expanded(
                      child: InputDecorator(
                        decoration: _inputDecoration("Versión MC"),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: _versionMap.containsKey(_mcVersion)
                                ? _mcVersion
                                : null,
                            dropdownColor: const Color(0xFF2C2C2C),
                            style: const TextStyle(color: Colors.white),
                            isDense: true,
                            items: _versionMap.keys
                                .map(
                                  (v) => DropdownMenuItem(
                                    value: v,
                                    child: Text(v),
                                  ),
                                )
                                .toList(),
                            onChanged: (v) {
                              if (v != null) {
                                setState(() {
                                  _mcVersion = v;
                                  _neoForgeVersion = _versionMap[v]!.first;
                                });
                              }
                            },
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: InputDecorator(
                        decoration: _inputDecoration("NeoForge"),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value:
                                _versionMap[_mcVersion]?.contains(
                                      _neoForgeVersion,
                                    ) ==
                                    true
                                ? _neoForgeVersion
                                : null,
                            dropdownColor: const Color(0xFF2C2C2C),
                            style: const TextStyle(color: Colors.white),
                            isDense: true,
                            items: (_versionMap[_mcVersion] ?? [])
                                .map(
                                  (v) => DropdownMenuItem(
                                    value: v,
                                    child: Text(v),
                                  ),
                                )
                                .toList(),
                            onChanged: (v) {
                              if (v != null) {
                                setState(() => _neoForgeVersion = v);
                              }
                            },
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Game Directory
                TextFormField(
                  controller: _gameDirController,
                  style: const TextStyle(color: Colors.white),
                  decoration: _inputDecoration("Carpeta de Juego (Opcional)")
                      .copyWith(
                        suffixIcon: IconButton(
                          icon: const Icon(
                            Icons.folder_open,
                            color: AppTheme.primary,
                          ),
                          onPressed: () async {
                            final path = await getDirectoryPath();
                            if (path != null) {
                              setState(() => _gameDirController.text = path);
                            }
                          },
                        ),
                      ),
                ),
                const SizedBox(height: 16),

                // Custom RAM
                CheckboxListTile(
                  title: const Text(
                    "Usar RAM personalizada",
                    style: TextStyle(color: Colors.white),
                  ),
                  value: _useCustomRam,
                  onChanged: (v) => setState(() => _useCustomRam = v ?? false),
                  activeColor: AppTheme.primary,
                  contentPadding: EdgeInsets.zero,
                ),

                if (_useCustomRam) ...[
                  Text(
                    "Mínima: ${_minRam}MB",
                    style: const TextStyle(color: Colors.white70),
                  ),
                  Slider(
                    value: _minRam.toDouble(),
                    min: 512,
                    max: 8192,
                    divisions: 15,
                    activeColor: AppTheme.primary,
                    onChanged: (v) => setState(() => _minRam = v.toInt()),
                  ),
                  Text(
                    "Máxima: ${_maxRam}MB",
                    style: const TextStyle(color: Colors.white70),
                  ),
                  Slider(
                    value: _maxRam.toDouble(),
                    min: 1024,
                    max: 16384,
                    divisions: 30,
                    activeColor: AppTheme.primary,
                    onChanged: (v) => setState(() => _maxRam = v.toInt()),
                  ),
                ],

                const SizedBox(height: 16),
                // Java Args
                TextFormField(
                  controller: _javaArgsController,
                  style: const TextStyle(color: Colors.white),
                  decoration: _inputDecoration("Argumentos Java (Opcional)"),
                ),
              ],
            ),
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text("Cancelar"),
        ),
        ElevatedButton(
          onPressed: () {
            if (_formKey.currentState!.validate()) {
              Navigator.of(context).pop({
                'name': _nameController.text,
                'mcVersion': _mcVersion,
                'neoForgeVersion': _neoForgeVersion,
                'gameDir': _gameDirController.text.isEmpty
                    ? null
                    : _gameDirController.text,
                'minRam': _useCustomRam ? _minRam : null,
                'maxRam': _useCustomRam ? _maxRam : null,
                'javaArgs': _javaArgsController.text.isEmpty
                    ? null
                    : _javaArgsController.text,
              });
            }
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.primary,
            foregroundColor: Colors.white,
          ),
          child: const Text("Guardar"),
        ),
      ],
    );
  }

  InputDecoration _inputDecoration(String label) {
    return InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(color: Colors.white54),
      filled: true,
      fillColor: Colors.white.withOpacity(0.05),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide.none,
      ),
    );
  }
}
