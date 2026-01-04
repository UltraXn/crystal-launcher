import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:path/path.dart' as p;

class LaunchService {
  Future<void> launchGame({
    required String ramMB,
    required bool enableBridge,
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
    final testEnvDir = p.join(projectRoot, 'apps', 'game-bridge', 'test-env');

    final List<String> args = [
      '-Xmx${ramMB}M',
    ];

    if (classpath != null && classpath.isNotEmpty) {
      args.add('-cp');
      args.add(classpath.join(';'));
    }

    if (enableBridge) {
      // Find agent.jar in test-env for now
      final agentPath =
          p.join(projectRoot, 'apps', 'game-bridge', 'test-env', 'agent.jar');
      args.add('-javaagent:$agentPath');
    }

    args.add(mainClass);

    // Mock arguments for real MC if needed
    if (mainClass != "com.crystaltides.test.FakeMinecraft") {
      args.addAll([
        '--version',
        'CrystalTides-v1',
        '--accessToken',
        '0',
        '--gameDir',
        testEnvDir,
        '--assetsDir',
        p.join(testEnvDir, 'assets'),
        '--assetIndex',
        '1.21', // TODO: Dynamically resolve from version JSON
        '--userType',
        'mojang',
        '--uuid',
        '0',
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
      process.stdout.transform(SystemEncoding().decoder).listen((data) {
        debugPrint("🎮 [GAME]: ${data.trim()}");
      });

      process.stderr.transform(SystemEncoding().decoder).listen((data) {
        debugPrint("❌ [GAME ERROR]: ${data.trim()}");
      });

      final exitCode = await process.exitCode;
      debugPrint("🏁 Game Process Terminated with code: $exitCode");
    } catch (e) {
      debugPrint("⛔ Launch Failure: $e");
    }
  }
}
