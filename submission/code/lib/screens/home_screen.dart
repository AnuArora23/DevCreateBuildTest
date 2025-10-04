
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:feather_icons/feather_icons.dart';

import '../utils/theme.dart';
import 'alerts/map_screen.dart';
import 'gossip/gossip_screen.dart';

final selectedNavigationIndexProvider = StateProvider<int>((ref) => 0);

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedIndex = ref.watch(selectedNavigationIndexProvider);

    // Screen list according to your specifications
    final screens = [
      const MapScreen(),      // Alerts (The Live Map Dashboard)
      const GossipScreen(),   // Gossip (The Community Forum)
    ];

    return Scaffold(
      body: IndexedStack(
        index: selectedIndex,
        children: screens,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(
            top: BorderSide(color: AppColors.divider, width: 1),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: selectedIndex,
          onTap: (index) {
            ref.read(selectedNavigationIndexProvider.notifier).state = index;
          },
          type: BottomNavigationBarType.fixed,
          backgroundColor: AppColors.cardBackground,
          selectedItemColor: AppColors.primaryAccent,
          unselectedItemColor: AppColors.secondaryText,
          elevation: 0,
          selectedLabelStyle: AppTextStyles.labelSmall.copyWith(
            color: AppColors.primaryAccent,
            fontWeight: FontWeight.w500,
          ),
          unselectedLabelStyle: AppTextStyles.labelSmall,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(FeatherIcons.mapPin),
              label: 'Alerts',
            ),
            BottomNavigationBarItem(
              icon: Icon(FeatherIcons.messageSquare),
              label: 'Gossip',
            ),
          ],
        ),
      ),
    );
  }
}
