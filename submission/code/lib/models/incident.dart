import 'package:json_annotation/json_annotation.dart';
import 'person.dart';

part 'incident.g.dart';

@JsonSerializable()
class Incident {
  final String id;
  final String title;
  @JsonKey(name: 'source_url')
  final String sourceUrl;
  @JsonKey(name: 'incident_timestamp')
  final DateTime incidentTimestamp;
  @JsonKey(name: 'location_text_raw')
  final String locationTextRaw;
  final double latitude;
  final double longitude;
  @JsonKey(name: 'location_confidence')
  final String locationConfidence;
  @JsonKey(name: 'approximated_radius_meters')
  final int approximatedRadiusMeters;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  @JsonKey(name: 'full_text_content')
  final String? fullTextContent;
  final List<Person> persons;

  Incident({
    required this.id,
    required this.title,
    required this.sourceUrl,
    required this.incidentTimestamp,
    required this.locationTextRaw,
    required this.latitude,
    required this.longitude,
    required this.locationConfidence,
    required this.approximatedRadiusMeters,
    required this.createdAt,
    this.fullTextContent,
    this.persons = const [],
  });

  factory Incident.fromJson(Map<String, dynamic> json) =>
      _$IncidentFromJson(json);

  Map<String, dynamic> toJson() => _$IncidentToJson(this);
}