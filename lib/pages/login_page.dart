import 'package:flutter/material.dart';
import '../services/session_service.dart';
import '../theme/app_theme.dart';
// import 'register_page.dart'; // Removed

enum LoginMode { guest, microsoft }

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _nicknameController = TextEditingController();

  LoginMode _selectedMode = LoginMode.guest;
  // final _emailController = TextEditingController(); // Removed
  // final _passwordController = TextEditingController(); // Removed
  // bool _isLoading = false; // Removed

  String? _errorMessage;

  void _handleGuestLogin() async {
    final nick = _nicknameController.text.trim();
    if (nick.isEmpty || nick.length < 3) {
      setState(
        () => _errorMessage = "El nick debe tener al menos 3 caracteres.",
      );
      return;
    }

    try {
      await SessionService().loginGuest(nick);
    } catch (e) {
      if (mounted) setState(() => _errorMessage = "Error iniciando sesión: $e");
    }
  }

  // _handleCrystalLogin removed

  void _handleMicrosoftLogin() async {
    setState(() {
      _errorMessage = "Microsoft Login en construcción...";
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: Stack(
        children: [
          // Background generic
          Positioned.fill(
            child: Container(
              color: AppTheme.background, // Solid background
            ),
          ),
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    AppTheme.backgroundAlt.withValues(alpha: 0.2),
                    AppTheme.background,
                  ],
                ),
              ),
            ),
          ),

          Center(
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              width: 480, // Slightly wider for 3 tabs
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: Colors.black45,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.white10),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.5),
                    blurRadius: 24,
                    offset: const Offset(0, 8),
                  ),
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    offset: const Offset(0, 4),
                    blurRadius: 10,
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Header
                  const Icon(
                    Icons.diamond_outlined,
                    size: 48,
                    color: AppTheme.accent,
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    "CrystalTides",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // 3-Way Toggle Switch
                  Container(
                    height: 48,
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        _buildTabButton("Invitado", LoginMode.guest),
                        _buildTabButton("Premium", LoginMode.microsoft),
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Dynamic Content
                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 300),
                    child: KeyedSubtree(
                      key: ValueKey(_selectedMode),
                      child: _buildContent(),
                    ),
                  ),

                  // Error Message
                  if (_errorMessage != null) ...[
                    const SizedBox(height: 16),
                    Text(
                      _errorMessage!,
                      style: const TextStyle(
                        color: Colors.redAccent,
                        fontSize: 13,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ],
              ),
            ),
          ),

          // Direct Connection Footer
          Positioned(
            bottom: 32,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: Colors.black26,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.dns, size: 14, color: Colors.white54),
                    const SizedBox(width: 8),
                    Text(
                      "IP Directa: mc.crystaltidesSMP.net",
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.5),
                        fontSize: 12,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabButton(String label, LoginMode mode) {
    final isSelected = _selectedMode == mode;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() {
          _selectedMode = mode;
          _errorMessage = null; // Clear errors on switch
        }),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: isSelected ? _getModeColor(mode) : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            label,
            style: TextStyle(
              color: isSelected ? Colors.white : Colors.white54,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              fontSize: 13,
            ),
          ),
        ),
      ),
    );
  }

  Color _getModeColor(LoginMode mode) {
    switch (mode) {
      // case LoginMode.crystal: // Removed

      case LoginMode.guest:
        return Colors.orangeAccent.withValues(alpha: 0.8);
      case LoginMode.microsoft:
        return const Color(0xFF00A4EF);
    }
  }

  Widget _buildContent() {
    switch (_selectedMode) {
      case LoginMode.guest:
        return _buildGuestContent();
      case LoginMode.microsoft:
        return _buildMicrosoftContent();
    }
  }

  // _buildCrystalContent removed

  Widget _buildGuestContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          "Juega inmediatamente con un apodo temporal.\nTu progreso no se guardará si cambias de PC.",
          textAlign: TextAlign.center,
          style: TextStyle(color: Colors.white54, fontSize: 13, height: 1.4),
        ),
        const SizedBox(height: 24),
        TextField(
          controller: _nicknameController,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            labelText: 'Apodo (Nick)',
            labelStyle: const TextStyle(color: Colors.white54),
            prefixIcon: const Icon(Icons.person_outline, color: Colors.white54),
            filled: true,
            fillColor: Colors.white.withValues(alpha: 0.05),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
            focusedBorder: const OutlineInputBorder(
              borderSide: BorderSide(color: Colors.orangeAccent),
            ),
          ),
        ),
        const SizedBox(height: 32),
        ElevatedButton(
          onPressed: _handleGuestLogin,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.orangeAccent.shade700,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          child: const Text(
            "JUGAR AHORA",
            style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1),
          ),
        ),
      ],
    );
  }

  Widget _buildMicrosoftContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          "Usa tu cuenta de Minecraft Java Edition.\nRequerido para servidores Premium.",
          textAlign: TextAlign.center,
          style: TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
        ),
        const SizedBox(height: 32),
        ElevatedButton.icon(
          onPressed: _handleMicrosoftLogin,
          icon: const Icon(Icons.window, color: Colors.white),
          label: const Text(
            "MICROSOFT LOGIN",
            style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1),
          ),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF00A4EF),
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
        const SizedBox(height: 70), // Spacer filler
      ],
    );
  }
}
