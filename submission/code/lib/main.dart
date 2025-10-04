import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'utils/theme.dart';
import 'screens/main_screen.dart';
import 'screens/onboarding/onboarding_screen.dart';
import 'config/api_config.dart';

void main() {
  // Print API configuration on startup
  ApiConfig.printConfig();
  
  runApp(const ProviderScope(child: GosipApp()));
}

class GosipApp extends StatelessWidget {
  const GosipApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GOSIP',
      theme: AppTheme.lightTheme,
      home: const OnboardingScreen(), // Start with onboarding
      debugShowCheckedModeBanner: false,
    );
  }
}