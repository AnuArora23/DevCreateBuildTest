
import 'package:flutter/material.dart';
import 'home_screen.dart';
import 'dashboard/dashboard_screen.dart';

class MainScreen extends StatelessWidget {
  const MainScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final PageController controller = PageController();
    return Scaffold(
      body: PageView(
        controller: controller,
        children: const <Widget>[
          HomeScreen(),
          DashboardScreen(),
        ],
      ),
    );
  }
}
