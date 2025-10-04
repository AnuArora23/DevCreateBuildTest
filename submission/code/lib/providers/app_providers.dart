import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gosip/models/case_file.dart';
import 'package:gosip/services/database_service.dart';
import 'package:gosip/models/gossip_message.dart';
import 'package:gosip/models/monitored_zone.dart';
import 'package:gosip/services/api_service.dart';
import 'package:gosip/models/incident.dart';
import 'package:gosip/models/osint_report.dart';

part 'app_providers.g.dart';

@riverpod
ApiService apiService(ApiServiceRef ref) {
  return ApiService();
}

@riverpod
Future<List<Incident>> incidents(IncidentsRef ref) async {
  return ref.watch(apiServiceProvider).getIncidents();
}

@riverpod
Future<List<CaseFile>> caseFiles(CaseFilesRef ref) {
  return DatabaseService.getAllCaseFiles();
}

@riverpod
Future<List<GossipMessage>> gossipMessages(GossipMessagesRef ref) {
  return DatabaseService.getAllGossipMessages();
}

@riverpod
Future<List<MonitoredZone>> monitoredZones(MonitoredZonesRef ref) {
  return DatabaseService.getAllMonitoredZones();
}

@riverpod
DatabaseService databaseService(DatabaseServiceRef ref) {
  return DatabaseService();
}

@riverpod
Future<List<Map<String, dynamic>>> caseFilesWithMessageCounts(CaseFilesWithMessageCountsRef ref) async {
  return await DatabaseService.getCaseFilesWithMessageCounts();
}

// Search query state provider
final searchQueryProvider = StateProvider<String>((ref) => '');

final searchReportsProvider = FutureProvider<List<OsintReport>>((ref) async {
  final query = ref.watch(searchQueryProvider);
  if (query.isEmpty) {
    return [];
  }
  return await DatabaseService.searchReports(query);
});

final searchCaseFilesProvider = FutureProvider<List<CaseFile>>((ref) async {
  final query = ref.watch(searchQueryProvider);
  if (query.isEmpty) {
    return [];
  }
  return await DatabaseService.searchCaseFiles(query);
});

final caseFileByIdProvider = FutureProvider.family<CaseFile?, String>((ref, caseFileId) async {
  return await DatabaseService.getCaseFileById(caseFileId);
});

// Message notifier provider for chat functionality
@riverpod
class MessageNotifier extends _$MessageNotifier {
  @override
  Future<List<GossipMessage>> build(String caseFileId) async {
    return await DatabaseService.getMessagesByCaseFileId(caseFileId);
  }

  Future<void> addMessage(String username, String messageText) async {
    final gossipMessage = GossipMessage(
      messageId: DateTime.now().millisecondsSinceEpoch.toString(),
      caseFileId: caseFileId,
      username: username,
      messageText: messageText,
      timestamp: DateTime.now().toIso8601String(),
      upvotes: 0,
    );
    
    await DatabaseService.insertMessage(gossipMessage);
    
    // Refresh the state
    ref.invalidateSelf();
  }

  Future<void> deleteMessage(String messageId) async {
    await DatabaseService.deleteMessage(messageId);
    
    // Refresh the state
    ref.invalidateSelf();
  }
}

// Zone notifier provider for managing monitored zones
@riverpod
class ZoneNotifier extends _$ZoneNotifier {
  @override
  Future<List<MonitoredZone>> build() async {
    return await DatabaseService.getAllMonitoredZones();
  }

  Future<void> addZone(MonitoredZone zone) async {
    await DatabaseService.insertMonitoredZone(zone);
    
    // Refresh the state
    ref.invalidateSelf();
  }

  Future<void> updateZone(MonitoredZone zone) async {
    await DatabaseService.updateMonitoredZone(zone);
    
    // Refresh the state
    ref.invalidateSelf();
  }

  Future<void> deleteZone(String zoneId) async {
    await DatabaseService.deleteMonitoredZone(zoneId);
    
    // Refresh the state
    ref.invalidateSelf();
  }
}

// Case files notifier provider for managing case files
final caseFilesNotifierProvider = FutureProvider<List<CaseFile>>((ref) async {
  return await DatabaseService.getAllCaseFiles();
});

// Reports provider (for OSINT reports)
final reportsProvider = FutureProvider<List<OsintReport>>((ref) async {
  return await DatabaseService.getAllReports();
});

// User location provider for storing current user location
final userLocationProvider = StateProvider<Map<String, double>?>((ref) => null);