import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:feather_icons/feather_icons.dart';

import '../../utils/theme.dart';
import '../../providers/app_providers.dart';
import '../../models/monitored_zone.dart';
import 'manage_zones_screen.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final zonesAsync = ref.watch(zoneNotifierProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        centerTitle: false,
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.screenPadding),
        children: [
          // User Profile Section
          _buildProfileHeader(),
          const SizedBox(height: AppSpacing.large),
          
          // Monitored Zones Quick View
          _buildMonitoredZonesSection(context, ref, zonesAsync),
          const SizedBox(height: AppSpacing.large),
          
          // Settings Options
          _buildSettingsSection(context, ref),
        ],
      ),
    );
  }

  Widget _buildProfileHeader() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.medium),
        child: Row(
          children: [
            const CircleAvatar(
              radius: 30,
              backgroundColor: AppColors.primaryAccent,
              child: Icon(
                FeatherIcons.user,
                color: Colors.white,
                size: 30,
              ),
            ),
            const SizedBox(width: AppSpacing.medium),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Anonymous User',
                    style: AppTextStyles.headlineMedium,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Community Safety Observer',
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.secondaryText,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMonitoredZonesSection(BuildContext context, WidgetRef ref, AsyncValue<List<MonitoredZone>> zonesAsync) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.medium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(
                  FeatherIcons.mapPin,
                  color: AppColors.primaryAccent,
                  size: 20,
                ),
                const SizedBox(width: AppSpacing.small),
                Text(
                  'Monitored Zones',
                  style: AppTextStyles.bodyLarge.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const Spacer(),
                TextButton(
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (context) => const ManageZonesScreen(),
                      ),
                    );
                  },
                  child: const Text('Manage'),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.small),
            zonesAsync.when(
              data: (zones) => zones.isEmpty
                  ? Text(
                      'No monitored zones set up yet',
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.secondaryText,
                      ),
                    )
                  : Column(
                      children: zones.take(3).map((zone) => _buildZoneItem(zone, ref)).toList(),
                    ),
              loading: () => const Center(
                child: Padding(
                  padding: EdgeInsets.all(AppSpacing.small),
                  child: CircularProgressIndicator(color: AppColors.primaryAccent),
                ),
              ),
              error: (error, stackTrace) => Text(
                'Failed to load zones',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.negative,
                ),
              ),
            ),
            if (zonesAsync.value != null && zonesAsync.value!.length > 3) ...[
              const SizedBox(height: AppSpacing.small),
              Text(
                'And ${zonesAsync.value!.length - 3} more...',
                style: AppTextStyles.labelSmall,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildZoneItem(MonitoredZone zone, WidgetRef ref) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.small),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: zone.isActive ? AppColors.positive : AppColors.secondaryText,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: AppSpacing.small),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  zone.zoneName,
                  style: AppTextStyles.bodyMedium.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  '${(zone.radiusMeters / 1000).toStringAsFixed(1)}km radius',
                  style: AppTextStyles.labelSmall,
                ),
              ],
            ),
          ),
          Switch(
            value: zone.notificationEnabled,
            onChanged: (value) {
              final updatedZone = MonitoredZone(
                id: zone.id,
                zoneId: zone.zoneId,
                zoneName: zone.zoneName,
                centerLatitude: zone.centerLatitude,
                centerLongitude: zone.centerLongitude,
                radiusMeters: zone.radiusMeters,
                createdDate: zone.createdDate,
                isActive: zone.isActive,
                notificationEnabled: value,
              );
              ref.read(zoneNotifierProvider.notifier).updateZone(updatedZone);
            },
            activeColor: AppColors.primaryAccent,
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsSection(BuildContext context, WidgetRef ref) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Settings',
          style: AppTextStyles.headlineMedium,
        ),
        const SizedBox(height: AppSpacing.medium),
        
        _buildSettingsItem(
          icon: FeatherIcons.mapPin,
          title: 'Monitored Zones',
          subtitle: 'Manage your watched areas',
          onTap: () {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (context) => const ManageZonesScreen(),
              ),
            );
          },
        ),
        
        _buildSettingsItem(
          icon: FeatherIcons.bell,
          title: 'Notifications',
          subtitle: 'Configure alert preferences',
          onTap: () {
            _showNotificationSettings(context, ref);
          },
        ),
        
        _buildSettingsItem(
          icon: FeatherIcons.shield,
          title: 'Privacy & Security',
          subtitle: 'Manage your data and privacy',
          onTap: () {
            _showPrivacySettings(context);
          },
        ),
        
        _buildSettingsItem(
          icon: FeatherIcons.database,
          title: 'Database Management',
          subtitle: 'Reset or refresh data',
          onTap: () {
            _showDatabaseOptions(context, ref);
          },
        ),
        
        _buildSettingsItem(
          icon: FeatherIcons.helpCircle,
          title: 'Help & Support',
          subtitle: 'Get help and report issues',
          onTap: () {
            _showHelpDialog(context);
          },
        ),
        
        _buildSettingsItem(
          icon: FeatherIcons.info,
          title: 'About GOSIP',
          subtitle: 'Version 1.0.0',
          onTap: () {
            _showAboutDialog(context);
          },
        ),
      ],
    );
  }

  Widget _buildSettingsItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.small),
      child: ListTile(
        leading: Icon(
          icon,
          color: AppColors.primaryAccent,
        ),
        title: Text(
          title,
          style: AppTextStyles.bodyLarge,
        ),
        subtitle: Text(
          subtitle,
          style: AppTextStyles.bodyMedium,
        ),
        trailing: const Icon(
          FeatherIcons.chevronRight,
          color: AppColors.secondaryText,
        ),
        onTap: onTap,
      ),
    );
  }

  void _showNotificationSettings(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Notification Settings'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Configure how you receive alerts:',
              style: AppTextStyles.bodyMedium,
            ),
            const SizedBox(height: AppSpacing.medium),
            ListTile(
              title: const Text('Push Notifications'),
              subtitle: const Text('Receive alerts on your device'),
              trailing: Switch(
                value: true,
                onChanged: (value) {
                  // Handle notification toggle
                },
                activeColor: AppColors.primaryAccent,
              ),
            ),
            ListTile(
              title: const Text('High Priority Only'),
              subtitle: const Text('Only show urgent alerts'),
              trailing: Switch(
                value: false,
                onChanged: (value) {
                  // Handle priority filter toggle
                },
                activeColor: AppColors.primaryAccent,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _showPrivacySettings(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Privacy & Security'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Your Privacy Matters:',
              style: AppTextStyles.bodyLarge.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: AppSpacing.small),
            Text(
              '• Your location is never shared with other users\n'
              '• All data is stored locally on your device\n'
              '• No personal information is sent to external servers\n'
              '• You can delete all data at any time',
              style: AppTextStyles.bodyMedium,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _showDatabaseOptions(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Database Management'),
        content: Text(
          'Manage your local GOSIP database:',
          style: AppTextStyles.bodyMedium,
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _refreshData(ref);
            },
            child: const Text('Refresh Data'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
  }

  void _refreshData(WidgetRef ref) {
    ref.invalidate(reportsProvider);
    ref.invalidate(caseFilesProvider);
    ref.invalidate(caseFilesWithMessageCountsProvider);
    ref.invalidate(monitoredZonesProvider);
  }

  void _showHelpDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Help & Support'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'How to use GOSIP:',
              style: AppTextStyles.bodyLarge.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: AppSpacing.small),
            Text(
              '• Alerts: View real-time reports on the map\n'
              '• Gossip: Join discussions about incidents\n'
              '• Explore: Search for specific reports or cases\n'
              '• Profile: Manage your monitored zones',
              style: AppTextStyles.bodyMedium,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _showAboutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('About GOSIP'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'GOSIP - Interactive Intelligence Dashboard',
              style: AppTextStyles.bodyLarge.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: AppSpacing.small),
            Text(
              'Version 1.0.0',
              style: AppTextStyles.bodyMedium,
            ),
            const SizedBox(height: AppSpacing.medium),
            Text(
              'Your interactive dashboard for community safety and awareness. GOSIP provides real-time OSINT data to help you stay informed about your surroundings.',
              style: AppTextStyles.bodyMedium,
            ),
            const SizedBox(height: AppSpacing.medium),
            Text(
              'Built with Flutter and powered by local OSINT analysis.',
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.secondaryText,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
}
