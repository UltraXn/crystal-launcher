import 'package:flutter/material.dart';
import '../services/session_service.dart';
import '../theme/app_theme.dart';
import 'register_page.dart';

enum LoginMode { guest, account, microsoft }

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _nicknameController = TextEditingController();

  bool _isLoading = false;
  LoginMode _selectedMode = LoginMode.account; // Default to Account
  String? _errorMessage;

  Future<void> _handleAccountLogin() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final email = _emailController.text.trim();
      final password = _passwordController.text.trim();

      if (email.isEmpty || password.isEmpty) {
        throw 'Por favor ingresa correo y contraseña.';
      }

      await SessionService().loginCrystal(email, password);
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceAll('Exception: ', '');
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _handleGuestLogin() async {
    // Made async
    final nick = _nicknameController.text.trim();
    if (nick.isEmpty || nick.length < 3) {
      setState(
        () => _errorMessage = "El nick debe tener al menos 3 caracteres.",
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      await SessionService().loginGuest(nick);
      // Navigation handled by AuthWrapper via listener
    } catch (e) {
      setState(() => _errorMessage = "Error iniciando sesión: $e");
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

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
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment.center,
                  radius: 1.2,
                  colors: [
                    AppTheme.backgroundAlt.withOpacity(0.4),
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
                    color: Colors.black.withOpacity(0.5),
                    blurRadius: 24,
                    offset: const Offset(0, 8),
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
                      color: Colors.white.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        _buildTabButton("Invitado", LoginMode.guest),
                        _buildTabButton("Cuenta", LoginMode.account),
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
      case LoginMode.guest:
        return Colors.orangeAccent.withOpacity(0.8);
      case LoginMode.account:
        return AppTheme.primary;
      case LoginMode.microsoft:
        return const Color(0xFF00A4EF);
    }
  }

  Widget _buildContent() {
    switch (_selectedMode) {
      case LoginMode.guest:
        return _buildGuestContent();
      case LoginMode.account:
        return _buildAccountContent();
      case LoginMode.microsoft:
        return _buildMicrosoftContent();
    }
  }

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
            fillColor: Colors.white.withOpacity(0.05),
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

  Widget _buildAccountContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextField(
          controller: _emailController,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            labelText: 'Correo Electrónico',
            labelStyle: const TextStyle(color: Colors.white54),
            prefixIcon: const Icon(Icons.email_outlined, color: Colors.white54),
            filled: true,
            fillColor: Colors.white.withOpacity(0.05),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
            focusedBorder: const OutlineInputBorder(
              borderSide: BorderSide(color: AppTheme.accent),
            ),
          ),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _passwordController,
          obscureText: true,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            labelText: 'Contraseña',
            labelStyle: const TextStyle(color: Colors.white54),
            prefixIcon: const Icon(Icons.lock_outline, color: Colors.white54),
            filled: true,
            fillColor: Colors.white.withOpacity(0.05),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
            focusedBorder: const OutlineInputBorder(
              borderSide: BorderSide(color: AppTheme.accent),
            ),
          ),
        ),
        const SizedBox(height: 32),
        ElevatedButton(
          onPressed: _isLoading ? null : _handleAccountLogin,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.primary,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          child: _isLoading
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              : const Text(
                  "ENTRAR",
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1,
                  ),
                ),
        ),
        const SizedBox(height: 16),
        Center(
          child: TextButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const RegisterPage()),
              );
            },
            child: Text(
              "Crear Cuenta CrystalTides",
              style: TextStyle(
                color: AppTheme.text.withOpacity(0.6),
                fontSize: 13,
              ),
            ),
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
