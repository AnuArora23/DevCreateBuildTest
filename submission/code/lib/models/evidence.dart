import 'dart:convert';

class Evidence {
  final int? id;
  final String evidenceId;
  final String caseFileId;
  final String evidenceType;
  final String? sourceUrl;
  final String? description;
  final String collectedDate;
  final Map<String, dynamic> metadata;

  Evidence({
    this.id,
    required this.evidenceId,
    required this.caseFileId,
    required this.evidenceType,
    this.sourceUrl,
    this.description,
    required this.collectedDate,
    required this.metadata,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'evidence_id': evidenceId,
      'case_file_id': caseFileId,
      'evidence_type': evidenceType,
      'source_url': sourceUrl,
      'description': description,
      'collected_date': collectedDate,
      'metadata': jsonEncode(metadata),
    };
  }

  factory Evidence.fromMap(Map<String, dynamic> map) {
    return Evidence(
      id: map['id']?.toInt(),
      evidenceId: map['evidence_id'] ?? '',
      caseFileId: map['case_file_id'] ?? '',
      evidenceType: map['evidence_type'] ?? '',
      sourceUrl: map['source_url'],
      description: map['description'],
      collectedDate: map['collected_date'] ?? '',
      metadata: map['metadata'] != null ? Map<String, dynamic>.from(jsonDecode(map['metadata'])) : {},
    );
  }

  @override
  String toString() {
    return 'Evidence{id: $id, evidenceId: $evidenceId, caseFileId: $caseFileId, evidenceType: $evidenceType}';
  }
}