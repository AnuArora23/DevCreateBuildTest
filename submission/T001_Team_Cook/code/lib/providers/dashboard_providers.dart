
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gosip/models/incident.dart';
import 'dart:ui';

import 'package:gosip/providers/app_providers.dart';

// Incidents Provider
final incidentsProvider = FutureProvider<List<Incident>>((ref) async {
  final apiService = ref.read(apiServiceProvider);
  return await apiService.getIncidents(limit: 100); // Fetch up to 100 incidents
});

// Search Query
final searchQueryProvider = StateProvider<String>((ref) => '');

// Pinned Nodes
class PinnedNode {
  final String id;
  final String keyword;

  PinnedNode({required this.id, required this.keyword});
}

class PinnedNodesNotifier extends StateNotifier<List<PinnedNode>> {
  PinnedNodesNotifier() : super([]);

  void addNode(String keyword) {
    final newNode = PinnedNode(id: DateTime.now().toIso8601String(), keyword: keyword);
    state = [...state, newNode];
  }

  void removeNode(PinnedNode node) {
    state = state.where((n) => n.id != node.id).toList();
  }
}

final pinnedNodesProvider = StateNotifierProvider<PinnedNodesNotifier, List<PinnedNode>>((ref) {
  return PinnedNodesNotifier();
});

// Node Positions
// For now, we'll just store offsets. A more complex solution might be needed later.
final nodePositionsProvider = StateProvider<Map<String, Offset>>((ref) => {});


final searchResultsProvider = FutureProvider<List<Incident>>((ref) async {
  final query = ref.watch(searchQueryProvider);
  final incidents = await ref.watch(incidentsProvider.future);

  if (query.isEmpty) {
    return [];
  }

  final lowerCaseQuery = query.toLowerCase();

  return incidents.where((incident) {
    return (incident.title.toLowerCase().contains(lowerCaseQuery)) ||
        (incident.fullTextContent?.toLowerCase().contains(lowerCaseQuery) ?? false);
  }).toList();
});
