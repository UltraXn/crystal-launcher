import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class CrystalTheme {
  static const navy = Color(0xFF020817);
  static const blue = Color(0xFF3B82F6);
  static const accent = Color(0xFF60A5FA);
  static const cardDark = Color(0xFF0F172A);
  static const glassBorder = Color(0x33FFFFFF);

  static ThemeData darkTheme(BuildContext context) {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: navy,
      colorScheme: const ColorScheme.dark(
        primary: blue,
        onPrimary: Colors.white,
        surface: navy,
        onSurface: Colors.white,
      ),
      textTheme: GoogleFonts.outfitTextTheme(
        Theme.of(context)
            .textTheme
            .apply(bodyColor: Colors.white, displayColor: Colors.white),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: blue,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 24),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          textStyle: const TextStyle(
              fontWeight: FontWeight.bold, letterSpacing: 2, fontSize: 16),
          elevation: 0,
        ),
      ),
    );
  }

  static BoxDecoration glassDecoration(
      {double opacity = 0.05, double radius = 16}) {
    return BoxDecoration(
      color: Colors.white.withValues(alpha: opacity),
      borderRadius: BorderRadius.circular(radius),
      border: Border.all(color: glassBorder),
    );
  }
}

class GlassBox extends StatelessWidget {
  final Widget child;
  final double blur;
  final double opacity;
  final double radius;

  const GlassBox({
    super.key,
    required this.child,
    this.blur = 15,
    this.opacity = 0.05,
    this.radius = 16,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(radius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
        child: Container(
          decoration:
              CrystalTheme.glassDecoration(opacity: opacity, radius: radius),
          child: child,
        ),
      ),
    );
  }
}
