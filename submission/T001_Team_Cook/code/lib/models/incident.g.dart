// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'incident.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Incident _$IncidentFromJson(Map<String, dynamic> json) => Incident(
      id: json['id'] as String,
      title: json['title'] as String,
      sourceUrl: json['source_url'] as String,
      incidentTimestamp: DateTime.parse(json['incident_timestamp'] as String),
      locationTextRaw: json['location_text_raw'] as String,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      locationConfidence: json['location_confidence'] as String,
      approximatedRadiusMeters:
          (json['approximated_radius_meters'] as num).toInt(),
      createdAt: DateTime.parse(json['created_at'] as String),
      fullTextContent: json['full_text_content'] as String?,
      persons: (json['persons'] as List<dynamic>?)
              ?.map((e) => Person.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );

Map<String, dynamic> _$IncidentToJson(Incident instance) => <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'source_url': instance.sourceUrl,
      'incident_timestamp': instance.incidentTimestamp.toIso8601String(),
      'location_text_raw': instance.locationTextRaw,
      'latitude': instance.latitude,
      'longitude': instance.longitude,
      'location_confidence': instance.locationConfidence,
      'approximated_radius_meters': instance.approximatedRadiusMeters,
      'created_at': instance.createdAt.toIso8601String(),
      'full_text_content': instance.fullTextContent,
      'persons': instance.persons,
    };
