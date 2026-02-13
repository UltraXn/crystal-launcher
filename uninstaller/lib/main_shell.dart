import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:window_manager/window_manager.dart';
import 'services/uninstallation_service.dart';

class CrystalTidesUninstaller extends StatelessWidget {
  final String? installDir;

  const CrystalTidesUninstaller({super.key, this.installDir});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: Colors.transparent,
        textTheme: GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme),
      ),
      home: UninstallerHome(installDir: installDir),
    );
  }
}

class UninstallerHome extends StatefulWidget {
  final String? installDir;

  const UninstallerHome({super.key, this.installDir});

  @override
  State<UninstallerHome> createState() => _UninstallerHomeState();
}

enum UninstallerStep { welcome, uninstalling, finish }

const Map<String, Map<String, String>> _i18n = {
  'Español': {
    'header': 'Desinstalador de CrystalTidesSMP',
    'welcome': '¿Desinstalar Crystal Launcher?',
    'sub_welcome': 'Se eliminarán todos los archivos de la aplicación, accesos directos y registros del sistema.',
    'uninstalling': 'Desinstalando...',
    'status_reg': 'Eliminando registros...',
    'status_files': 'Borrando archivos...',
    'status_clean': 'Limpiando sistema...',
    'finish': 'Desinstalación Completada',
    'sub_finish': 'Crystal Launcher se ha eliminado correctamente de tu equipo.',
    'btn_cancel': 'CANCELAR',
    'btn_uninstall': 'DESINSTALAR',
    'btn_exit': 'SALIR',
    'err_running': 'El launcher está abierto. Ciérralo antes de continuar.',
  },
  'English': {
    'header': 'CrystalTidesSMP Uninstaller',
    'welcome': 'Uninstall Crystal Launcher?',
    'sub_welcome': 'This will remove all application files, shortcuts, and system registry entries.',
    'uninstalling': 'Uninstalling...',
    'status_reg': 'Removing registry entries...',
    'status_files': 'Deleting files...',
    'status_clean': 'Cleaning up system...',
    'finish': 'Uninstallation Completed',
    'sub_finish': 'Crystal Launcher has been successfully removed from your computer.',
    'btn_cancel': 'CANCEL',
    'btn_uninstall': 'UNINSTALL',
    'btn_exit': 'EXIT',
    'err_running': 'The launcher is currently running. Please close it first.',
  }
};

class _UninstallerHomeState extends State<UninstallerHome> {
  UninstallerStep _currentStep = UninstallerStep.welcome;
  double _progress = 0.0;
  String _statusKey = 'status_reg';
  final String _selectedLanguage = 'Español';

  String t(String key) => _i18n[_selectedLanguage]?[key] ?? key;

  Future<void> _startUninstallation() async {
    setState(() => _currentStep = UninstallerStep.uninstalling);

    try {
      final service = UninstallationService();
      await service.startUninstall((progress) {
        setState(() {
          _progress = progress;
          if (progress < 0.4) {
            _statusKey = 'status_reg';
          } else if (progress < 0.8) {
            _statusKey = 'status_files';
          } else {
            _statusKey = 'status_clean';
          }
        });
      }, installDir: widget.installDir);
      
      setState(() => _currentStep = UninstallerStep.finish);
    } catch (e) {
      if (mounted) {
        String message = e.toString().contains("CON_RUNNING") 
            ? t('err_running') 
            : "Error: $e";
            
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(message), 
            backgroundColor: const Color(0xFFE74C3C),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
      setState(() => _currentStep = UninstallerStep.welcome);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Center(
        child: Container(
          width: 652, // 650 + 2 for overscan
          height: 482, // 480 + 2 for overscan
          padding: const EdgeInsets.all(1.0), // 1px overscan padding
          decoration: BoxDecoration(
            color: const Color(0xFF030308), // Mask color
            borderRadius: BorderRadius.circular(16),
          ),
          child: Container(
            width: 650,
            height: 480,
            decoration: BoxDecoration(
              color: const Color(0xFF030308),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF3498DB).withValues(alpha: 0.05),
                  blurRadius: 40,
                  spreadRadius: 5,
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Column(
                children: [
                  _buildHeader(),
                  Expanded(child: _buildBody()),
                  _buildFooter(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return GestureDetector(
      onPanStart: (_) => windowManager.startDragging(),
      child: Container(
        height: 50,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(color: Colors.white.withValues(alpha: 0.03)),
          ),
        ),
        child: Row(
          children: [
            Image.asset('assets/images/logo.png', width: 22, height: 22),
            const SizedBox(width: 12),
            Text(
              t('header'),
              style: GoogleFonts.outfit(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                letterSpacing: 1,
                color: Colors.white70,
              ),
            ),
            const Spacer(),
            IconButton(
              icon: const Icon(Icons.close, size: 18, color: Colors.white24),
              onPressed: () => windowManager.close(),
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
              hoverColor: Colors.white.withValues(alpha: 0.05),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBody() {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 400),
      child: Container(
        key: ValueKey(_currentStep),
        padding: const EdgeInsets.all(40),
        child: _getContentForStep(),
      ),
    );
  }

  Widget _getContentForStep() {
    switch (_currentStep) {
      case UninstallerStep.welcome:
        return _buildWelcomeBody();
      case UninstallerStep.uninstalling:
        return _buildUninstallingBody();
      case UninstallerStep.finish:
        return _buildFinishBody();
    }
  }

  Widget _buildWelcomeBody() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(Icons.delete_forever_outlined, size: 80, color: Color(0xFFE74C3C)),
        const SizedBox(height: 30),
        Text(
          t('welcome'),
          textAlign: TextAlign.center,
          style: GoogleFonts.outfit(
            fontSize: 26,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 15),
        Text(
          t('sub_welcome'),
          textAlign: TextAlign.center,
          style: GoogleFonts.outfit(
            fontSize: 14,
            color: Colors.white38,
            height: 1.5,
          ),
        ),
      ],
    );
  }

  Widget _buildUninstallingBody() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          t('uninstalling'),
          style: GoogleFonts.outfit(fontSize: 22, color: Colors.white),
        ),
        const SizedBox(height: 60),
        SizedBox(
          width: 100, height: 100,
          child: CircularProgressIndicator(
            value: _progress,
            strokeWidth: 2,
            backgroundColor: Colors.white.withValues(alpha: 0.05),
            color: const Color(0xFFE74C3C),
          ),
        ),
        const SizedBox(height: 60),
        Text(
          t(_statusKey).toUpperCase(),
          style: GoogleFonts.outfit(
            color: Colors.white24,
            fontSize: 10,
            letterSpacing: 2,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 15),
        Text(
          "${(_progress * 100).toInt()}%",
          style: GoogleFonts.outfit(
            color: const Color(0xFFE74C3C),
            fontSize: 24,
            fontWeight: FontWeight.w200,
          ),
        ),
      ],
    );
  }

  Widget _buildFinishBody() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(Icons.check_circle_outline, size: 80, color: Color(0xFF27AE60)),
        const SizedBox(height: 30),
        Text(
          t('finish'),
          style: GoogleFonts.outfit(fontSize: 26, fontWeight: FontWeight.w700, color: Colors.white),
        ),
        const SizedBox(height: 15),
        Text(
          t('sub_finish'),
          textAlign: TextAlign.center,
          style: GoogleFonts.outfit(fontSize: 14, color: Colors.white38),
        ),
      ],
    );
  }

  Widget _buildFooter() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 50, vertical: 30),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.01),
        border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.03))),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
           if (_currentStep == UninstallerStep.welcome)
            TextButton(
              onPressed: () => windowManager.close(),
              child: Text(t('btn_cancel'), style: const TextStyle(color: Colors.white38)),
            ),
          const Spacer(),
          _buildActionButton(),
        ],
      ),
    );
  }

  Widget _buildActionButton() {
    if (_currentStep == UninstallerStep.uninstalling) return const SizedBox.shrink();

    String labelKey = _currentStep == UninstallerStep.welcome ? "btn_uninstall" : "btn_exit";
    VoidCallback onPressed = _currentStep == UninstallerStep.welcome 
      ? _startUninstallation 
      : () => windowManager.close();

    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: _currentStep == UninstallerStep.welcome ? const Color(0xFFE74C3C) : const Color(0xFF27AE60),
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
      child: Text(t(labelKey), style: const TextStyle(fontWeight: FontWeight.bold)),
    );
  }
}
