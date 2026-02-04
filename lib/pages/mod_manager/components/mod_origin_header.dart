import 'package:flutter/material.dart';

class ModOriginHeader extends StatelessWidget {
  final String title;
  final IconData icon;

  const ModOriginHeader({super.key, required this.title, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12, left: 4),
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
    );
  }
}
