import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class CrystalTheme {
  // Web Client Exact Palette
  // Background is deeply dark but often overlayed
  static const navy = Color(0xFF020817); // --background
  static const secondary = Color(0xFF0F0F14); // --bg-alt (approx from css)

  // The REAL Accent Color from layout.css (#89d9d1) - "Crystal Teal"
  static const accent = Color(0xFF89D9D1);
  static const accentDark = Color(0xFF168C80);

  // Text Colors
  static const textPrimary = Colors.white;
  static const textMuted = Color(0xFF94A3B8); // Slate-400

  // Compatibility Aliases (Mapping old structure to new identity)
  static const blue = accent;
  static const cardDark = navy;
  static const glassBorder = Color(0x1AFFFFFF); // Low opacity white
  static const green = Color(0xFF4ADE80); // Success green

  // Gradients
  static const LinearGradient titleGradient = LinearGradient(
    colors: [
      Color(0xFF89d9d1),
      Color(0xFF168c80),
      Color(0xFF0c5952),
      Color(0xFF168c80),
      Color(0xFF89d9d1),
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient buttonGradient = LinearGradient(
    colors: [
      Color(0xFF168C80),
      Color(0xFF0C5952),
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static ThemeData darkTheme(BuildContext context) {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: navy,
      colorScheme: const ColorScheme.dark(
        primary: accent, // Use Crystal Teal as primary
        onPrimary: Colors.black, // Dark text on light teal
        secondary: accentDark,
        surface: navy,
        onSurface: Colors.white,
      ),
      textTheme: GoogleFonts.outfitTextTheme(
        Theme.of(context).textTheme.apply(
              bodyColor: Colors.white,
              displayColor: Colors.white,
            ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: accentDark, // Fallback color
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 24),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          textStyle: const TextStyle(
              fontWeight: FontWeight.bold, letterSpacing: 2, fontSize: 16),
          elevation: 10,
          shadowColor: accent.withValues(alpha: 0.3),
        ),
      ),
    );
  }

  static BoxDecoration glassDecoration({
    double opacity = 0.05,
    double radius = 16,
    Color borderColor = const Color(0x1AFFFFFF),
  }) {
    return BoxDecoration(
      color: Colors.white.withValues(alpha: opacity),
      borderRadius: BorderRadius.circular(radius),
      border: Border.all(color: borderColor),
    );
  }
}

class GlassBox extends StatelessWidget {
  final Widget child;
  final double blur;
  final double opacity;
  final double radius;
  final Color? borderColor;

  const GlassBox({
    super.key,
    required this.child,
    this.blur = 20, // Increased blur to match CSS "backdrop-filter: blur(20px)"
    this.opacity = 0.03, // Lower opacity for subtler look
    this.radius = 20, // Match CSS "border-radius: 20px"
    this.borderColor,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(radius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: opacity),
            borderRadius: BorderRadius.circular(radius),
            border: Border.all(
                color: borderColor ?? const Color(0x1AFFFFFF), width: 1),
          ),
          child: child,
        ),
      ),
    );
  }
}

// Helper widget for Gradient Text
class GradientText extends StatelessWidget {
  final String text;
  final TextStyle? style;
  final Gradient gradient;

  const GradientText(
    this.text, {
    super.key,
    required this.gradient,
    this.style,
  });

  @override
  Widget build(BuildContext context) {
    return ShaderMask(
      blendMode: BlendMode.srcIn,
      shaderCallback: (bounds) => gradient.createShader(
        Rect.fromLTWH(0, 0, bounds.width, bounds.height),
      ),
      child: Text(text, style: style),
    );
  }
}
