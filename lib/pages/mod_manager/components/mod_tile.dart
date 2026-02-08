import 'package:flutter/material.dart';
import '../../../services/mod_service.dart';
import '../../../theme/app_theme.dart';

class ModTile extends StatefulWidget {
  final ModItem mod;
  final Function(ModItem) onToggle;

  const ModTile({super.key, required this.mod, required this.onToggle});

  @override
  State<ModTile> createState() => _ModTileState();
}

class _ModTileState extends State<ModTile> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeInOut,
        key: ValueKey(widget.mod.path),
        margin: const EdgeInsets.only(bottom: 10),
        decoration: BoxDecoration(
          color: _isHovered 
              ? Colors.white.withValues(alpha: 0.08)
              : Colors.white.withValues(alpha: 0.03),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: _isHovered 
                ? AppTheme.accent.withValues(alpha: 0.3)
                : (widget.mod.isEnabled
                    ? AppTheme.accent.withValues(alpha: 0.1)
                    : Colors.white.withValues(alpha: 0.05)),
            width: 1,
          ),
          boxShadow: _isHovered ? [
            BoxShadow(
                    color: AppTheme.accent.withValues(alpha: 0.05),
              blurRadius: 15,
              offset: const Offset(0, 5),
            )
          ] : [],
        ),
        child: InkWell(
          onTap: () => widget.onToggle(widget.mod),
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Row(
              children: [
                // Icono del Mod con efecto Glassmorphism
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12),
                    border:
                        Border.all(color: Colors.white.withValues(alpha: 0.1)),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: widget.mod.iconUrl != null
                        ? Image.network(
                            widget.mod.iconUrl!,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) =>
                                _buildFallbackIcon(),
                          )
                        : _buildFallbackIcon(),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              widget.mod.name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                color: widget.mod.isEnabled
                                    ? Colors.white
                                    : Colors.white.withValues(alpha: 0.4),
                                fontWeight: widget.mod.isEnabled
                                    ? FontWeight.bold
                                    : FontWeight.normal,
                                fontSize: 15,
                                letterSpacing: 0.2,
                              ),
                            ),
                          ),
                          if (widget.mod.isImported) ...[
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 6,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.orange.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(
                                  color: Colors.orange.withValues(alpha: 0.3),
                                  width: 0.5,
                                ),
                              ),
                              child: const Text(
                                "IMPORTADO",
                                style: TextStyle(
                                  color: Colors.orange,
                                  fontSize: 8,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        widget.mod.description ?? widget.mod.fileName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: widget.mod.isEnabled
                              ? Colors.white.withValues(alpha: 0.5)
                              : Colors.white.withValues(alpha: 0.2),
                          fontSize: 12,
                        ),
                      ),
                      if (widget.mod.categories.isNotEmpty) ...[
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 6,
                          runSpacing: 6,
                          children: widget.mod.categories.take(3).map((cat) {
                            return Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 3,
                              ),
                              decoration: BoxDecoration(
                                color: AppTheme.accent.withValues(alpha: 0.08),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(
                                  color:
                                      AppTheme.accent.withValues(alpha: 0.15),
                                  width: 0.5,
                                ),
                              ),
                              child: Text(
                                cat.toUpperCase(),
                                style: TextStyle(
                                  color: AppTheme.accent.withValues(alpha: 0.8),
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.4,
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Switch(
                  value: widget.mod.isEnabled,
                  activeTrackColor: AppTheme.accent.withValues(alpha: 0.3),
                  activeThumbColor: AppTheme.accent,
                  onChanged: (val) => widget.onToggle(widget.mod),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFallbackIcon() {
    return Icon(
      widget.mod.isEnabled ? Icons.extension : Icons.extension_off,
      color: widget.mod.isEnabled
          ? AppTheme.accent.withValues(alpha: 0.6)
          : Colors.white.withValues(alpha: 0.1),
      size: 24,
    );
  }
}
