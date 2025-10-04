class MonitoredZone {
  final int? id;
  final String zoneId;
  final String zoneName;
  final double centerLatitude;
  final double centerLongitude;
  final int radiusMeters;
  final String createdDate;
  final bool isActive;
  final bool notificationEnabled;

  MonitoredZone({
    this.id,
    required this.zoneId,
    required this.zoneName,
    required this.centerLatitude,
    required this.centerLongitude,
    required this.radiusMeters,
    required this.createdDate,
    this.isActive = true,
    this.notificationEnabled = true,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'zone_id': zoneId,
      'zone_name': zoneName,
      'center_latitude': centerLatitude,
      'center_longitude': centerLongitude,
      'radius_meters': radiusMeters,
      'created_date': createdDate,
      'is_active': isActive ? 1 : 0,
      'notification_enabled': notificationEnabled ? 1 : 0,
    };
  }

  factory MonitoredZone.fromMap(Map<String, dynamic> map) {
    return MonitoredZone(
      id: map['id']?.toInt(),
      zoneId: map['zone_id'] ?? '',
      zoneName: map['zone_name'] ?? '',
      centerLatitude: map['center_latitude']?.toDouble() ?? 0.0,
      centerLongitude: map['center_longitude']?.toDouble() ?? 0.0,
      radiusMeters: map['radius_meters']?.toInt() ?? 1000,
      createdDate: map['created_date'] ?? '',
      isActive: map['is_active'] == 1,
      notificationEnabled: map['notification_enabled'] == 1,
    );
  }

  @override
  String toString() {
    return 'MonitoredZone{id: $id, zoneId: $zoneId, zoneName: $zoneName, centerLatitude: $centerLatitude, centerLongitude: $centerLongitude}';
  }
}