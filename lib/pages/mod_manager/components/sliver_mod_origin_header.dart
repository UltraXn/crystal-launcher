import 'package:flutter/material.dart';

class SliverModOriginHeader extends StatelessWidget {
  final String title;
  final IconData icon;

  const SliverModOriginHeader({
    super.key,
    required this.title,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return SliverPadding(
      padding: const EdgeInsets.only(top: 24, bottom: 12, left: 4),
      sliver: SliverToBoxAdapter(
        child: Row(
          children: [
            Icon(icon, size: 16, color: Colors.white24),
            const SizedBox(width: 8),
            Text(
              title,
              style: const TextStyle(
                color: Colors.white24,
                fontSize: 12,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
