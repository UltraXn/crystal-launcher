import 'package:flutter/material.dart';
import 'package:window_manager/window_manager.dart';

class WindowTitleBar extends StatelessWidget {
  final bool showMaximize;
  final VoidCallback? onClose;

  const WindowTitleBar({
    super.key,
    this.showMaximize = false,
    this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 32,
      child: Row(
        children: [
          // Drag Area
          Expanded(
            child: GestureDetector(
              onPanStart: (details) {
                windowManager.startDragging();
              },
              behavior: HitTestBehavior.translucent, // Capture clicks on empty space
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                alignment: Alignment.centerLeft,
                child: const Text(
                  "CrystalTides Client",
                  style: TextStyle(
                    color: Colors.white54,
                    fontSize: 12,
                    fontFamily: 'Inter',
                  ),
                ),
              ),
            ),
          ),

          // Window Controls
          _WindowButton(
            icon: Icons.minimize,
            onTap: () async => await windowManager.minimize(),
          ),
          if (showMaximize)
            _WindowButton(
              icon: Icons.crop_square,
              onTap: () async {
                if (await windowManager.isMaximized()) {
                  await windowManager.unmaximize();
                } else {
                  await windowManager.maximize();
                }
              },
            ),
          _WindowButton(
            icon: Icons.close,
            isClose: true,
            onTap: onClose ?? () async => await windowManager.close(),
          ),
        ],
      ),
    );
  }
}

class _WindowButton extends StatefulWidget {
  final IconData icon;
  final VoidCallback onTap;
  final bool isClose;

  const _WindowButton({
    required this.icon,
    required this.onTap,
    this.isClose = false,
  });

  @override
  State<_WindowButton> createState() => _WindowButtonState();
}

class _WindowButtonState extends State<_WindowButton> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: widget.onTap,
      onHover: (value) => WidgetsBinding.instance.addPostFrameCallback((_) { if(mounted) setState(() => _isHovered = value); }),
      child: Container(
        width: 48,
        height: 32,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: _isHovered
              ? (widget.isClose ? Colors.red : Colors.white.withAlpha(25))
              : Colors.transparent,
        ),
        child: Icon(
          widget.icon,
          size: 16,
          color: Colors.white,
        ),
      ),
    );
  }
}
