import 'package:flutter/material.dart';

class AppTheme {
  static const Color background = Color(0xFF0B0C10); // Void
  static const Color backgroundAlt = Color(0xFF0C5952); // Deep Tide
  static const Color primary = Color(0xFF168C80); // Tide Teal
  static const Color accent = Color(0xFF89D9D1); // Crystal
  static const Color text = Color(0xFFFFFFFF);

  static final Color surfaceLow = const Color(
    0xFF1E1E1E,
  ).withOpacity(0.1);
  static final Color surfaceUltraLow = const Color(
    0xFFFFFFFF,
  ).withOpacity(0.05);
  static final Color borderLow = const Color(0xFFFFFFFF).withOpacity(0.1);
  static final Color accentLow = accent.withOpacity(0.2);
  static final Color accentMid = accent.withOpacity(0.5);
  static final Color accentUltraLow = accent.withOpacity(0.1);

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      fontFamily: 'Inter',
      scaffoldBackgroundColor: background,
      colorScheme: ColorScheme.fromSeed(
        seedColor: backgroundAlt,
        brightness: Brightness.dark,
        surface: background,
        primary: primary,
        secondary: backgroundAlt,
        tertiary: accent,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: text,
          elevation: 4,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        ),
      ),
    );
  }
}
