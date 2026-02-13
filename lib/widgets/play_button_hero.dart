import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../services/launcher_service.dart';

class PlayButtonHero extends StatefulWidget {
  const PlayButtonHero({super.key});

  @override
  State<PlayButtonHero> createState() => _PlayButtonHeroState();
}

class _PlayButtonHeroState extends State<PlayButtonHero> {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 220, // Fixed smaller width
      height: 50, // Much smaller height (was 80)
      decoration: BoxDecoration(
        color: AppTheme.primary,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () async {
            await LauncherService().launch(context: context);
          },
          borderRadius: BorderRadius.circular(8),
          child: const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.play_arrow_rounded,
                  size: 24,
                  color: Colors.white,
                ),
                SizedBox(width: 8),
                Text(
                  "JUGAR",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
