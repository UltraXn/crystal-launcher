import 'package:flutter/material.dart';
import '../../../services/mod_service.dart';
import '../../../theme/app_theme.dart';
import 'mod_tile.dart';

class SliverModCategorySection extends StatefulWidget {
  final String title;
  final IconData icon;
  final List<ModItem> items;
  final Function(ModItem) onToggleMod;
  final bool initiallyExpanded;

  const SliverModCategorySection({
    super.key,
    required this.title,
    required this.icon,
    required this.items,
    required this.onToggleMod,
    this.initiallyExpanded = false,
  });

  @override
  State<SliverModCategorySection> createState() =>
      _SliverModCategorySectionState();
}

class _SliverModCategorySectionState extends State<SliverModCategorySection> {
  late bool _isExpanded;

  @override
  void initState() {
    super.initState();
    _isExpanded = widget.initiallyExpanded;
  }

  @override
  Widget build(BuildContext context) {
    return SliverMainAxisGroup(
      slivers: [
        SliverToBoxAdapter(
          child: Container(
            margin: const EdgeInsets.only(top: 24, bottom: 8),
            child: InkWell(
              onTap: () => setState(() => _isExpanded = !_isExpanded),
              borderRadius: BorderRadius.circular(12),
              overlayColor: WidgetStateProperty.all(
                Colors.white.withValues(alpha: 0.05),
              ),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppTheme.accent.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(widget.icon, color: AppTheme.accent, size: 20),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.title,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w900,
                              fontSize: 16,
                              letterSpacing: 0.2,
                            ),
                          ),
                          Text(
                            "${widget.items.length} mods instalados",
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.3),
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ),
                    AnimatedRotation(
                      duration: const Duration(milliseconds: 200),
                      turns: _isExpanded ? 0 : -0.25,
                      child: Icon(
                        Icons.expand_more,
                        color: Colors.white.withValues(alpha: 0.2),
                        size: 20,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
        if (_isExpanded)
          SliverPadding(
            padding: const EdgeInsets.only(top: 8),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate((context, index) {
                return ModTile(
                  mod: widget.items[index],
                  onToggle: widget.onToggleMod,
                );
              }, childCount: widget.items.length),
            ),
          ),
      ],
    );
  }
}
