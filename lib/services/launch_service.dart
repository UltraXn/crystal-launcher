import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:path/path.dart' as p;

class LaunchService {
  Future<void> launchGame({
    required String ramMB,
    required bool enableBridge,
    required String version,
    String assetIndex = "1.21",
    List<String>? classpath,
    String mainClass = "com.crystaltides.test.FakeMinecraft",
    String? gameDir,
  }) async {
    debugPrint("🚀 Initializing Launch Sequence...");
    debugPrint(
        "📦 RAM: ${ramMB}MB | Agent: ${enableBridge ? 'ENABLED' : 'DISABLED'}");

    // In a real scenario, this would point to the Minecraft JAR
    // For our "Frankenstein" test, we use the test-env we built earlier
    final projectRoot = Directory.current.path;
    // Dynamic resolution for Submodule vs Monorepo root
    String testEnvDir = p.join(projectRoot, 'apps', 'game-bridge', 'test-env');

    // If running from apps/launcher, look in sibling directory
    if (!await Directory(testEnvDir).exists()) {
      testEnvDir =
          p.normalize(p.join(projectRoot, '..', 'game-bridge', 'test-env'));
    }

    final List<String> args = [
      '-Xmx${ramMB}M',
    ];

    if (classpath != null && classpath.isNotEmpty) {
      args.add('-cp');
      args.add(classpath.join(';'));
    }

    if (enableBridge) {
      // Find agent.jar in the resolved test-env
      final agentPath = p.join(testEnvDir, 'agent.jar');
      args.add('-javaagent:$agentPath');
    }

    args.add(mainClass);

    // Mock arguments for real MC if needed
    if (mainClass != "com.crystaltides.test.FakeMinecraft") {
      args.addAll([
        '--version',
        version,
        '--accessToken',
        '0',
        '--gameDir',
        testEnvDir,
        '--assetsDir',
        p.join(testEnvDir, 'assets'),
        '--assetIndex',
        assetIndex,
        '--userType',
        'mojang',
        '--uuid',
        '00000000-0000-0000-0000-000000000000', // Valid format to prevent crash
      ]);
    }

    debugPrint("🎬 Executing: java ${args.join(' ')}");

    try {
      final process = await Process.start(
        'java',
        args,
        workingDirectory: testEnvDir,
      );

      // Listen to output
      process.stdout.transform(const SystemEncoding().decoder).listen((data) {
        debugPrint("🎮 [GAME]: ${data.trim()}");
      });

      process.stderr.transform(const SystemEncoding().decoder).listen((data) {
        debugPrint("❌ [GAME ERROR]: ${data.trim()}");
      });

      final exitCode = await process.exitCode;
      debugPrint("🏁 Game Process Terminated with code: $exitCode");
    } catch (e) {
      debugPrint("⛔ Launch Failure: $e");
    }
  }
}
