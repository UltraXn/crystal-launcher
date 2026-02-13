import 'package:flutter/material.dart';
import 'package:window_manager/window_manager.dart';

class WindowControls extends StatelessWidget {
  const WindowControls({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 40,
      child: Row(
        children: [
          // Drag Area (Spacer)
          Expanded(
            child: GestureDetector(
              onPanStart: (details) {
                windowManager.startDragging();
              },
              child: Container(color: Colors.transparent),
            ),
          ),

          // Window Buttons
          _WindowButton(
            icon: Icons.remove,
            onPressed: () async {
              await windowManager.minimize();
            },
          ),
          _WindowButton(
            icon: Icons.close,
            hoverColor: Colors.red,
            onPressed: () async {
              await windowManager.close();
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
    );
  }
}

class _WindowButton extends StatefulWidget {
  final IconData icon;
  final VoidCallback onPressed;
  final Color? hoverColor;

  const _WindowButton({
    required this.icon,
    required this.onPressed,
    this.hoverColor,
  });

  @override
  State<_WindowButton> createState() => _WindowButtonState();
}

class _WindowButtonState extends State<_WindowButton> {
  bool _isHovering = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => WidgetsBinding.instance.addPostFrameCallback((_) { if(mounted) setState(() => _isHovering = true); }),
      onExit: (_) => WidgetsBinding.instance.addPostFrameCallback((_) { if(mounted) setState(() => _isHovering = false); }),
      child: GestureDetector(
        onTap: widget.onPressed,
        child: Container(
          width: 40,
          height: 30, // Botones un poco mas pequeños que la barra
          decoration: BoxDecoration(
            color: _isHovering
                ? (widget.hoverColor ?? Colors.white.withValues(alpha: 0.1))
                : Colors.transparent,
            borderRadius: BorderRadius.circular(4),
          ),
          child: Icon(widget.icon, size: 16, color: Colors.white),
        ),
      ),
    );
  }
}
