import 'dart:convert';

import 'package:gosip/models/evidence.dart';

class CaseFile {
  final int? id;
  final String caseFileId;
  final String title;
  final String summary;
  final int reportCount;
  final String? primarySource;
  final String firstReported;
  final String lastUpdated;
  final double latitude;
  final double longitude;
  final String? sentimentLabel;
  final double? sentimentScore;
  final List<String> tags;
  final String status;
  final String priority;
  final List<Evidence> evidence;

  CaseFile({
    this.id,
    required this.caseFileId,
    required this.title,
    required this.summary,
    this.reportCount = 1,
    this.primarySource,
    required this.firstReported,
    required this.lastUpdated,
    required this.latitude,
    required this.longitude,
    this.sentimentLabel,
    this.sentimentScore,
    required this.tags,
    this.status = 'Active',
    this.priority = 'Medium',
    this.evidence = const [],
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'case_file_id': caseFileId,
      'title': title,
      'summary': summary,
      'report_count': reportCount,
      'primary_source': primarySource,
      'first_reported': firstReported,
      'last_updated': lastUpdated,
      'latitude': latitude,
      'longitude': longitude,
      'sentiment_label': sentimentLabel,
      'sentiment_score': sentimentScore,
      'tags': jsonEncode(tags),
      'status': status,
      'priority': priority,
      'evidence': jsonEncode(evidence.map((e) => e.toMap()).toList()),
    };
  }

  factory CaseFile.fromMap(Map<String, dynamic> map) {
    return CaseFile(
      id: map['id']?.toInt(),
      caseFileId: map['case_file_id'] ?? '',
      title: map['title'] ?? '',
      summary: map['summary'] ?? '',
      reportCount: map['report_count']?.toInt() ?? 1,
      primarySource: map['primary_source'],
      firstReported: map['first_reported'] ?? '',
      lastUpdated: map['last_updated'] ?? '',
      latitude: map['latitude']?.toDouble() ?? 0.0,
      longitude: map['longitude']?.toDouble() ?? 0.0,
      sentimentLabel: map['sentiment_label'],
      sentimentScore: map['sentiment_score']?.toDouble(),
      tags: map['tags'] != null ? List<String>.from(jsonDecode(map['tags'])) : [],
      status: map['status'] ?? 'Active',
      priority: map['priority'] ?? 'Medium',
      evidence: map['evidence'] != null
          ? List<Evidence>.from(
              jsonDecode(map['evidence']).map((e) => Evidence.fromMap(e)))
          : [],
    );
  }

  @override
  String toString() {
    return 'CaseFile{id: $id, caseFileId: $caseFileId, title: $title, latitude: $latitude, longitude: $longitude}';
  }

  CaseFile copyWith({
    int? id,
    String? caseFileId,
    String? title,
    String? summary,
    int? reportCount,
    String? primarySource,
    String? firstReported,
    String? lastUpdated,
    double? latitude,
    double? longitude,
    String? sentimentLabel,
    double? sentimentScore,
    List<String>? tags,
    String? status,
    String? priority,
    List<Evidence>? evidence,
  }) {
    return CaseFile(
      id: id ?? this.id,
      caseFileId: caseFileId ?? this.caseFileId,
      title: title ?? this.title,
      summary: summary ?? this.summary,
      reportCount: reportCount ?? this.reportCount,
      primarySource: primarySource ?? this.primarySource,
      firstReported: firstReported ?? this.firstReported,
      lastUpdated: lastUpdated ?? this.lastUpdated,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      sentimentLabel: sentimentLabel ?? this.sentimentLabel,
      sentimentScore: sentimentScore ?? this.sentimentScore,
      tags: tags ?? this.tags,
      status: status ?? this.status,
      priority: priority ?? this.priority,
      evidence: evidence ?? this.evidence,
    );
  }
}