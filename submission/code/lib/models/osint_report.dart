import 'dart:convert';

class OsintReport {
  final int? id;
  final String caseFileId;
  final String reportDate;
  final String content;
  final String? authorUsername;
  final String? url;
  final String? sourcePlatform;
  final String? sentimentLabel;
  final double? sentimentScore;
  final double latitude;
  final double longitude;
  final List<String> tags;

  OsintReport({
    this.id,
    required this.caseFileId,
    required this.reportDate,
    required this.content,
    this.authorUsername,
    this.url,
    this.sourcePlatform,
    this.sentimentLabel,
    this.sentimentScore,
    required this.latitude,
    required this.longitude,
    required this.tags,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'case_file_id': caseFileId,
      'report_date': reportDate,
      'content': content,
      'author_username': authorUsername,
      'url': url,
      'source_platform': sourcePlatform,
      'sentiment_label': sentimentLabel,
      'sentiment_score': sentimentScore,
      'latitude': latitude,
      'longitude': longitude,
      'tags': jsonEncode(tags),
    };
  }

  factory OsintReport.fromMap(Map<String, dynamic> map) {
    return OsintReport(
      id: map['id']?.toInt(),
      caseFileId: map['case_file_id'] ?? '',
      reportDate: map['report_date'] ?? '',
      content: map['content'] ?? '',
      authorUsername: map['author_username'],
      url: map['url'],
      sourcePlatform: map['source_platform'],
      sentimentLabel: map['sentiment_label'],
      sentimentScore: map['sentiment_score']?.toDouble(),
      latitude: map['latitude']?.toDouble() ?? 0.0,
      longitude: map['longitude']?.toDouble() ?? 0.0,
      tags: map['tags'] != null ? List<String>.from(jsonDecode(map['tags'])) : [],
    );
  }

  @override
  String toString() {
    return 'OsintReport{id: $id, caseFileId: $caseFileId, content: $content, latitude: $latitude, longitude: $longitude}';
  }
}