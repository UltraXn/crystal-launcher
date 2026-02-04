import 'package:flutter/material.dart';
import '../../../services/mod_service.dart';
import '../../../theme/app_theme.dart';
import 'mod_tile.dart';

class ModCategorySection extends StatefulWidget {
  final String title;
  final IconData icon;
  final List<ModItem> items;
  final bool initiallyExpanded;
  final Function(ModItem) onToggleMod;

  const ModCategorySection({
    super.key,
    required this.title,
    required this.icon,
    required this.items,
    required this.onToggleMod,
    this.initiallyExpanded = false,
  });

  @override
  State<ModCategorySection> createState() => _ModCategorySectionState();
}

class _ModCategorySectionState extends State<ModCategorySection> {
  late bool _isExpanded;
  List<Widget>? _cachedTiles;

  @override
  void initState() {
    super.initState();
    _isExpanded = widget.initiallyExpanded;
  }

  @override
  void didUpdateWidget(ModCategorySection oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.items != oldWidget.items) {
      _cachedTiles = null;
    }
  }

  @override
  Widget build(BuildContext context) {
    _cachedTiles ??= widget.items
        .map((m) => ModTile(mod: m, onToggle: widget.onToggleMod))
        .toList();

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppTheme.surfaceLow,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.surfaceUltraLow),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header
          InkWell(
            onTap: () => setState(() => _isExpanded = !_isExpanded),
            borderRadius: BorderRadius.vertical(
              top: const Radius.circular(12),
              bottom: Radius.circular(_isExpanded ? 0 : 12),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Icon(widget.icon, color: AppTheme.accent),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Text(
                      widget.title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  RotationTransition(
                    turns: AlwaysStoppedAnimation(_isExpanded ? 0.5 : 0),
                    child: const Icon(Icons.expand_more, color: Colors.white24),
                  ),
                ],
              ),
            ),
          ),
          // Content
          AnimatedSize(
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeInOut,
            child: _isExpanded
                ? Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(children: _cachedTiles!),
                  )
                : const SizedBox(width: double.infinity, height: 0),
          ),
        ],
      ),
    );
  }
}
