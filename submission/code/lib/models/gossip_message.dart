class GossipMessage {
  final int? id;
  final String messageId;
  final String caseFileId;
  final String username;
  final String messageText;
  final String timestamp;
  final bool isVerified;
  final int upvotes;

  GossipMessage({
    this.id,
    required this.messageId,
    required this.caseFileId,
    required this.username,
    required this.messageText,
    required this.timestamp,
    this.isVerified = false,
    this.upvotes = 0,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'message_id': messageId,
      'case_file_id': caseFileId,
      'username': username,
      'message_text': messageText,
      'timestamp': timestamp,
      'is_verified': isVerified ? 1 : 0,
      'upvotes': upvotes,
    };
  }

  factory GossipMessage.fromMap(Map<String, dynamic> map) {
    return GossipMessage(
      id: map['id']?.toInt(),
      messageId: map['message_id'] ?? '',
      caseFileId: map['case_file_id'] ?? '',
      username: map['username'] ?? '',
      messageText: map['message_text'] ?? '',
      timestamp: map['timestamp'] ?? '',
      isVerified: map['is_verified'] == 1,
      upvotes: map['upvotes']?.toInt() ?? 0,
    );
  }

  @override
  String toString() {
    return 'GossipMessage{id: $id, messageId: $messageId, username: $username, messageText: $messageText}';
  }
}