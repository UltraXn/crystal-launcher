import 'package:flutter/material.dart';

class AppTheme {
  static const Color background = Color(0xFF0B0C10); // Void
  static const Color backgroundAlt = Color(0xFF0C5952); // Deep Tide
  static const Color primary = Color(0xFF168C80); // Tide Teal
  static const Color accent = Color(0xFF89D9D1); // Crystal
  static const Color text = Color(0xFFFFFFFF);

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
