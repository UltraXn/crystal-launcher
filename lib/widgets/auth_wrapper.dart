import 'package:flutter/material.dart';
import '../services/session_service.dart';
import '../pages/login_page.dart';
import '../layouts/main_layout.dart';
import '../pages/home_page.dart';

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  @override
  void initState() {
    super.initState();
    SessionService().addListener(_onSessionChanged);
  }

  @override
  void dispose() {
    SessionService().removeListener(_onSessionChanged);
    super.dispose();
  }

  void _onSessionChanged() {
    setState(() {}); // Rebuild on session change
  }

  @override
  Widget build(BuildContext context) {
    if (SessionService().isLoggedIn) {
      return const MainLayout(child: HomePage());
    }
    return const LoginPage();
  }
}
