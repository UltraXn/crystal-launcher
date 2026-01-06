import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme.dart';
import '../../services/auth_service.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController _offlineController = TextEditingController();
  bool _isLoading = false;

  Future<void> _loginOffline() async {
    if (_offlineController.text.isEmpty) return;
    setState(() => _isLoading = true);

    try {
      final auth = context.read<AuthService>();
      await auth.loginOffline(_offlineController.text);
      // No explicit navigation needed; AuthWrapper listens to the stream
    } catch (e) {
      debugPrint("Login Error: $e");
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0C1425),
      body: Center(
        child: SizedBox(
          width: 400,
          height: 500,
          child: GlassBox(
            radius: 20,
            blur: 20,
            opacity: 0.1,
            child: Padding(
              padding: const EdgeInsets.all(40),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text(
                    "CRYSTAL LOGIN",
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      letterSpacing: 2,
                    ),
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    "Choose your path",
                    style: TextStyle(color: Colors.white54),
                  ),
                  const SizedBox(height: 50),

                  // Microsoft Login
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: Colors.black,
                      ),
                      onPressed: () async {
                        setState(() => _isLoading = true);
                        try {
                          await context
                              .read<AuthService>()
                              .loginMicrosoft(context);
                        } finally {
                          if (mounted) setState(() => _isLoading = false);
                        }
                      },
                      child: const Text("LOGIN WITH MICROSOFT"),
                    ),
                  ),

                  const SizedBox(height: 30),
                  const Row(
                    children: [
                      Expanded(child: Divider(color: Colors.white24)),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 10),
                        child:
                            Text("OR", style: TextStyle(color: Colors.white24)),
                      ),
                      Expanded(child: Divider(color: Colors.white24)),
                    ],
                  ),
                  const SizedBox(height: 30),

                  // Offline Login
                  TextField(
                    controller: _offlineController,
                    style: const TextStyle(color: Colors.white),
                    decoration: const InputDecoration(
                      labelText: "OFFLINE USERNAME",
                      labelStyle: TextStyle(color: Colors.white38),
                      enabledBorder: OutlineInputBorder(
                        borderSide: BorderSide(color: Colors.white24),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderSide: BorderSide(color: CrystalTheme.blue),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white10,
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Colors.white24),
                      ),
                      onPressed: _isLoading ? null : _loginOffline,
                      child: _isLoading
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text("ENTER OFFLINE"),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
