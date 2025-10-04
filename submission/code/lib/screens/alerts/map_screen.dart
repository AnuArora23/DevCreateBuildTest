import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:feather_icons/feather_icons.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:location/location.dart';

import '../../models/case_file.dart';
import '../../providers/app_providers.dart';
import '../../utils/theme.dart';
import '../../widgets/alert_bottom_sheet.dart';
import '../explore/explore_screen.dart';
import '../profile/profile_screen.dart';
import '../../models/incident.dart';
import '../incident/incident_detail_screen.dart';

class MapScreen extends ConsumerStatefulWidget {
  const MapScreen({super.key});

  @override
  ConsumerState<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends ConsumerState<MapScreen> {
  final MapController _mapController = MapController();
  Location location = Location();

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
  }

  void _getCurrentLocation() async {
    try {
      bool serviceEnabled = await location.serviceEnabled();
      if (!serviceEnabled) {
        serviceEnabled = await location.requestService();
        if (!serviceEnabled) {
          if (!mounted) return;
          ref.read(userLocationProvider.notifier).state = {
            'latitude': 30.819908,
            'longitude': 75.556128,
          };
          return;
        }
      }

      PermissionStatus permissionGranted = await location.hasPermission();
      if (permissionGranted == PermissionStatus.denied) {
        permissionGranted = await location.requestPermission();
        if (permissionGranted != PermissionStatus.granted) {
          if (!mounted) return;
          ref.read(userLocationProvider.notifier).state = {
            'latitude': 30.819908,
            'longitude': 75.556128,
          };
          return;
        }
      }

      LocationData locationData = await location.getLocation();
      if (!mounted) return;
      ref.read(userLocationProvider.notifier).state = {
        'latitude': locationData.latitude!,
        'longitude': locationData.longitude!,
      };
    } catch (e) {
      print("Error getting location: $e");
      if (!mounted) return;
      ref.read(userLocationProvider.notifier).state = {
        'latitude': 30.819908,
        'longitude': 75.556128,
      };
    }
  }

  void _showAlertBottomSheet(CaseFile caseFile) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => AlertBottomSheet(caseFile: caseFile),
    );
  }

  void _navigateToSearch() {
    Navigator.of(context).push(MaterialPageRoute(builder: (context) => const ExploreScreen()));
  }

  void _navigateToProfile() {
    Navigator.of(context).push(MaterialPageRoute(builder: (context) => const ProfileScreen()));
  }

  void _centerMapOnUser() {
    final userLocation = ref.read(userLocationProvider);
    if (userLocation != null) {
      _mapController.move(
        LatLng(userLocation['latitude']!, userLocation['longitude']!),
        13.0,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final incidentsAsync = ref.watch(incidentsProvider);
    final userLocation = ref.watch(userLocationProvider);

    return Scaffold(
      body: Stack(
        children: [
          incidentsAsync.when(
            data: (incidents) => _buildRealMap(incidents, userLocation),
            loading: () => const Center(
              child: CircularProgressIndicator(
                color: AppColors.primaryAccent,
              ),
            ),
            error: (error, stackTrace) {
              WidgetsBinding.instance.addPostFrameCallback((_) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(error.toString()),
                    backgroundColor: AppColors.negative,
                  ),
                );
              });
              return _buildRealMap([], userLocation); // Show map without incidents
            },
          ),
          _buildTopBar(),
          Positioned(
            bottom: 100,
            right: AppSpacing.screenPadding,
            child: FloatingActionButton(
              heroTag: "center_map",
              onPressed: _centerMapOnUser,
              child: const Icon(FeatherIcons.crosshair),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRealMap(List<Incident> incidents, Map<String, double>? userLocation) {
    final center = userLocation != null
        ? LatLng(userLocation['latitude']!, userLocation['longitude']!)
        : const LatLng(30.819908, 75.556128);

    return FlutterMap(
      mapController: _mapController,
      options: MapOptions(
        initialCenter: center,
        initialZoom: 13.0,
        minZoom: 3.0,
        maxZoom: 18.0,
      ),
      children: [
        TileLayer(
          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          userAgentPackageName: 'com.gosip.app',
          maxZoom: 19,
        ),
        MarkerLayer(
          markers: [
            if (userLocation != null)
              Marker(
                point: LatLng(userLocation['latitude']!, userLocation['longitude']!),
                width: 30,
                height: 30,
                child: Container(
                  decoration: BoxDecoration(
                    color: AppColors.primaryAccent,
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 3),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primaryAccent.withOpacity(0.3),
                        blurRadius: 12,
                        spreadRadius: 4,
                      ),
                    ],
                  ),
                  child: const Icon(
                    FeatherIcons.user,
                    color: Colors.white,
                    size: 16,
                  ),
                ),
              ),
            ...incidents.map((incident) {
              return Marker(
                point: LatLng(incident.latitude, incident.longitude),
                width: 30,
                height: 30,
                child: GestureDetector(
                  onTap: () {
                    Navigator.of(context).push(MaterialPageRoute(
                      builder: (context) => IncidentDetailScreen(incident: incident),
                    ));
                  },
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.purple,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.purple.withOpacity(0.4),
                          blurRadius: 8,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: Center(
                      child: Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ],
        ),
      ],
    );
  }

  Widget _buildTopBar() {
    return Positioned(
      top: MediaQuery.of(context).padding.top + AppSpacing.medium,
      left: AppSpacing.screenPadding,
      right: AppSpacing.screenPadding,
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: _navigateToSearch,
              child: Container(
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.cardBackground,
                  borderRadius: BorderRadius.circular(AppSpacing.borderRadius),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.shadow,
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: const Row(
                  children: [
                    SizedBox(width: AppSpacing.medium),
                    Icon(
                      FeatherIcons.search,
                      color: AppColors.secondaryText,
                      size: 20,
                    ),
                    SizedBox(width: AppSpacing.small),
                    Expanded(
                      child: Text(
                        'Search locations, incidents...',
                        style: TextStyle(
                          color: AppColors.secondaryText,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(width: AppSpacing.medium),
          GestureDetector(
            onTap: _navigateToProfile,
            child: CircleAvatar(
              radius: 24,
              backgroundColor: AppColors.cardBackground,
              child: const Icon(
                FeatherIcons.user,
                color: AppColors.primaryText,
              ),
            ),
          ),
        ],
      ),
    );
  }
}