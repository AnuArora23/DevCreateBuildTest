import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:feather_icons/feather_icons.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:uuid/uuid.dart';

import '../../utils/theme.dart';
import '../../providers/app_providers.dart';
import '../../models/monitored_zone.dart';

class ManageZonesScreen extends ConsumerStatefulWidget {
  const ManageZonesScreen({super.key});

  @override
  ConsumerState<ManageZonesScreen> createState() => _ManageZonesScreenState();
}

class _ManageZonesScreenState extends ConsumerState<ManageZonesScreen> {
  final MapController _mapController = MapController();
  LatLng? _selectedLocation;
  double _radiusSliderValue = 1000.0; // Default 1km
  final TextEditingController _nameController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final zonesAsync = ref.watch(zoneNotifierProvider);
    final userLocation = ref.watch(userLocationProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Manage Zones'),
        centerTitle: false,
        actions: [
          IconButton(
            icon: const Icon(FeatherIcons.plus),
            onPressed: () => _showAddZoneDialog(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Map View
          Expanded(
            flex: 2,
            child: Container(
              decoration: const BoxDecoration(
                border: Border(
                  bottom: BorderSide(color: AppColors.divider),
                ),
              ),
              child: _buildMapView(zonesAsync, userLocation),
            ),
          ),
          
          // Zones List
          Expanded(
            flex: 1,
            child: Container(
              padding: const EdgeInsets.all(AppSpacing.medium),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Your Monitored Zones',
                    style: AppTextStyles.headlineMedium,
                  ),
                  const SizedBox(height: AppSpacing.medium),
                  Expanded(
                    child: zonesAsync.when(
                      data: (zones) => _buildZonesList(zones),
                      loading: () => const Center(
                        child: CircularProgressIndicator(color: AppColors.primaryAccent),
                      ),
                      error: (error, stackTrace) => Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(
                              FeatherIcons.alertCircle,
                              color: AppColors.negative,
                              size: 48,
                            ),
                            const SizedBox(height: AppSpacing.medium),
                            Text(
                              'Failed to load zones',
                              style: AppTextStyles.bodyLarge,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMapView(AsyncValue<List<MonitoredZone>> zonesAsync, Map<String, double>? userLocation) {
    final center = userLocation != null
        ? LatLng(userLocation['latitude']!, userLocation['longitude']!)
        : const LatLng(37.7749, -122.4194);

    return FlutterMap(
      mapController: _mapController,
      options: MapOptions(
        initialCenter: center,
        initialZoom: 12.0,
        onTap: (tapPosition, point) {
          setState(() {
            _selectedLocation = point;
          });
        },
      ),
      children: [
        TileLayer(
          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          userAgentPackageName: 'com.gosip.app',
        ),
        
        // User location
        if (userLocation != null)
          MarkerLayer(
            markers: [
              Marker(
                point: LatLng(userLocation['latitude']!, userLocation['longitude']!),
                width: 30,
                height: 30,
                child: Container(
                  decoration: BoxDecoration(
                    color: AppColors.primaryAccent,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 3),
                  ),
                  child: const Icon(
                    FeatherIcons.user,
                    color: Colors.white,
                    size: 16,
                  ),
                ),
              ),
            ],
          ),
        
        // Selected location marker
        if (_selectedLocation != null)
          MarkerLayer(
            markers: [
              Marker(
                point: _selectedLocation!,
                width: 40,
                height: 40,
                child: const Icon(
                  FeatherIcons.mapPin,
                  color: AppColors.negative,
                  size: 40,
                ),
              ),
            ],
          ),
        
        // Existing zones
        zonesAsync.when(
          data: (zones) => CircleLayer(
            circles: zones.map((zone) => CircleMarker(
              point: LatLng(zone.centerLatitude, zone.centerLongitude),
              radius: zone.radiusMeters.toDouble(),
              useRadiusInMeter: true,
              color: zone.isActive 
                  ? AppColors.primaryAccent.withValues(alpha: 0.3)
                  : AppColors.secondaryText.withValues(alpha: 0.3),
              borderColor: zone.isActive 
                  ? AppColors.primaryAccent
                  : AppColors.secondaryText,
              borderStrokeWidth: 2,
            )).toList(),
          ),
          loading: () => const CircleLayer(circles: []),
          error: (error, stackTrace) => const CircleLayer(circles: []),
        ),
        
        // Zone markers
        zonesAsync.when(
          data: (zones) => MarkerLayer(
            markers: zones.map((zone) => Marker(
              point: LatLng(zone.centerLatitude, zone.centerLongitude),
              width: 30,
              height: 30,
              child: GestureDetector(
                onTap: () => _showZoneDetails(zone),
                child: Container(
                  decoration: BoxDecoration(
                    color: zone.isActive ? AppColors.primaryAccent : AppColors.secondaryText,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2),
                  ),
                  child: const Icon(
                    FeatherIcons.mapPin,
                    color: Colors.white,
                    size: 16,
                  ),
                ),
              ),
            )).toList(),
          ),
          loading: () => const MarkerLayer(markers: []),
          error: (error, stackTrace) => const MarkerLayer(markers: []),
        ),
      ],
    );
  }

  Widget _buildZonesList(List<MonitoredZone> zones) {
    if (zones.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              FeatherIcons.mapPin,
              color: AppColors.secondaryText,
              size: 48,
            ),
            const SizedBox(height: AppSpacing.medium),
            Text(
              'No zones created yet',
              style: AppTextStyles.bodyLarge.copyWith(
                color: AppColors.secondaryText,
              ),
            ),
            const SizedBox(height: AppSpacing.small),
            Text(
              'Tap the + button to add a zone',
              style: AppTextStyles.bodyMedium,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      itemCount: zones.length,
      itemBuilder: (context, index) {
        final zone = zones[index];
        return Card(
          margin: const EdgeInsets.only(bottom: AppSpacing.small),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: zone.isActive ? AppColors.primaryAccent : AppColors.secondaryText,
              child: const Icon(
                FeatherIcons.mapPin,
                color: Colors.white,
                size: 16,
              ),
            ),
            title: Text(
              zone.zoneName,
              style: AppTextStyles.bodyLarge,
            ),
            subtitle: Text(
              '${(zone.radiusMeters / 1000).toStringAsFixed(1)}km radius • ${zone.isActive ? "Active" : "Inactive"}',
              style: AppTextStyles.bodyMedium,
            ),
            trailing: PopupMenuButton(
              itemBuilder: (context) => [
                PopupMenuItem(
                  child: const Row(
                    children: [
                      Icon(FeatherIcons.edit, size: 16),
                      SizedBox(width: 8),
                      Text('Edit'),
                    ],
                  ),
                  onTap: () => _editZone(zone),
                ),
                PopupMenuItem(
                  child: const Row(
                    children: [
                      Icon(FeatherIcons.trash2, size: 16),
                      SizedBox(width: 8),
                      Text('Delete'),
                    ],
                  ),
                  onTap: () => _deleteZone(zone),
                ),
              ],
            ),
            onTap: () {
              _mapController.move(
                LatLng(zone.centerLatitude, zone.centerLongitude),
                14.0,
              );
            },
          ),
        );
      },
    );
  }

  void _showAddZoneDialog() {
    if (_selectedLocation == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please tap on the map to select a location first'),
          duration: Duration(seconds: 2),
        ),
      );
      return;
    }

    _nameController.clear();
    _radiusSliderValue = 1000.0;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Add Monitored Zone'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Zone Name',
                  hintText: 'e.g., Home, Work, School',
                ),
              ),
              const SizedBox(height: AppSpacing.medium),
              Text(
                'Radius: ${(_radiusSliderValue / 1000).toStringAsFixed(1)} km',
                style: AppTextStyles.bodyLarge,
              ),
              Slider(
                value: _radiusSliderValue,
                min: 100,
                max: 5000,
                divisions: 49,
                activeColor: AppColors.primaryAccent,
                onChanged: (value) {
                  setState(() {
                    _radiusSliderValue = value;
                  });
                },
              ),
              Text(
                'Location: ${_selectedLocation!.latitude.toStringAsFixed(4)}, ${_selectedLocation!.longitude.toStringAsFixed(4)}',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.secondaryText,
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                if (_nameController.text.trim().isNotEmpty) {
                  _addZone();
                  Navigator.pop(context);
                }
              },
              child: const Text('Add Zone'),
            ),
          ],
        ),
      ),
    );
  }

  void _addZone() {
    if (_selectedLocation == null) return;

    final zone = MonitoredZone(
      zoneId: const Uuid().v4(),
      zoneName: _nameController.text.trim(),
      centerLatitude: _selectedLocation!.latitude,
      centerLongitude: _selectedLocation!.longitude,
      radiusMeters: _radiusSliderValue.round(),
      createdDate: DateTime.now().toIso8601String(),
      isActive: true,
      notificationEnabled: true,
    );

    ref.read(zoneNotifierProvider.notifier).addZone(zone);
    
    setState(() {
      _selectedLocation = null;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Zone "${zone.zoneName}" added successfully'),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _editZone(MonitoredZone zone) {
    // Implementation for editing zones
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Zone editing coming soon'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  void _deleteZone(MonitoredZone zone) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Zone'),
        content: Text('Are you sure you want to delete "${zone.zoneName}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              ref.read(zoneNotifierProvider.notifier).deleteZone(zone.zoneId);
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Zone "${zone.zoneName}" deleted'),
                  duration: const Duration(seconds: 2),
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.negative,
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  void _showZoneDetails(MonitoredZone zone) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(zone.zoneName),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Radius: ${(zone.radiusMeters / 1000).toStringAsFixed(1)} km'),
            Text('Status: ${zone.isActive ? "Active" : "Inactive"}'),
            Text('Notifications: ${zone.notificationEnabled ? "Enabled" : "Disabled"}'),
            Text('Created: ${DateTime.parse(zone.createdDate).toLocal().toString().split(' ')[0]}'),
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