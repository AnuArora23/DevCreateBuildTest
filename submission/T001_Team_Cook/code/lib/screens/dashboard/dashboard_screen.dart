import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:feather_icons/feather_icons.dart';
import 'package:gosip/models/incident.dart';
import 'package:gosip/models/person.dart';
import 'package:gosip/providers/dashboard_providers.dart';
import 'package:gosip/utils/theme.dart';
import 'package:graphview/GraphView.dart';
import 'dart:math' as math;

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> with TickerProviderStateMixin {
  late AnimationController _pulseController;
  final TextEditingController _searchController = TextEditingController();
  bool _showSearch = false;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final incidents = ref.watch(incidentsProvider);

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      body: CustomScrollView(
        slivers: [
          _buildAppBar(context),
          SliverToBoxAdapter(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    AppColors.primaryAccent.withOpacity(0.03),
                    AppColors.scaffoldBackground,
                  ],
                ),
              ),
              child: Column(
                children: [
                  if (_showSearch) _buildSearchSection(),
                  _buildStatsCards(incidents),
                ],
              ),
            ),
          ),
          _buildGraphVisualization(incidents),
        ],
      ),
    );
  }

  Widget _buildAppBar(BuildContext context) {
    return SliverAppBar(
      expandedHeight: 120,
      floating: false,
      pinned: true,
      backgroundColor: AppColors.scaffoldBackground,
      elevation: 0,
      centerTitle: true,
      flexibleSpace: FlexibleSpaceBar(
        centerTitle: true,
        title: const Text(
          'Dashboard',
          style: TextStyle(
            color: AppColors.primaryText,
            fontWeight: FontWeight.w600,
            fontSize: 20,
          ),
        ),
        background: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                AppColors.primaryAccent.withOpacity(0.1),
                AppColors.secondaryAccent.withOpacity(0.05),
              ],
            ),
          ),
        ),
      ),
      actions: [
        IconButton(
          icon: Icon(
            _showSearch ? FeatherIcons.x : FeatherIcons.search,
            color: AppColors.primaryAccent,
          ),
          onPressed: () {
            setState(() {
              _showSearch = !_showSearch;
              if (!_showSearch) {
                _searchController.clear();
                ref.read(searchQueryProvider.notifier).state = '';
              }
            });
          },
        ),
        IconButton(
          icon: const Icon(FeatherIcons.refreshCw, color: AppColors.primaryAccent),
          onPressed: () {
            ref.invalidate(incidentsProvider);
          },
        ),
      ],
    );
  }

  Widget _buildSearchSection() {
    final searchResults = ref.watch(searchResultsProvider);

    return Padding(
      padding: const EdgeInsets.all(AppSpacing.medium),
      child: Column(
        children: [
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(AppSpacing.borderRadius),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primaryAccent.withOpacity(0.1),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: TextField(
              controller: _searchController,
              onChanged: (query) {
                ref.read(searchQueryProvider.notifier).state = query;
              },
              decoration: InputDecoration(
                hintText: 'Search incidents, persons, locations...',
                hintStyle: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.secondaryText.withOpacity(0.6),
                ),
                prefixIcon: const Icon(FeatherIcons.search, color: AppColors.primaryAccent),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(FeatherIcons.x, color: AppColors.secondaryText),
                        onPressed: () {
                          _searchController.clear();
                          ref.read(searchQueryProvider.notifier).state = '';
                        },
                      )
                    : null,
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.medium,
                  vertical: AppSpacing.medium,
                ),
              ),
            ),
          ),
          searchResults.when(
            data: (results) {
              if (results.isEmpty && _searchController.text.isNotEmpty) {
                return Padding(
                  padding: const EdgeInsets.all(AppSpacing.medium),
                  child: Text(
                    'No results found',
                    style: AppTextStyles.bodyMedium.copyWith(color: AppColors.secondaryText),
                  ),
                );
              }
              if (results.isEmpty) return const SizedBox.shrink();
              
              return Container(
                margin: const EdgeInsets.only(top: AppSpacing.medium),
                constraints: const BoxConstraints(maxHeight: 200),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(AppSpacing.borderRadius),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.shadow,
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: ListView.separated(
                  shrinkWrap: true,
                  itemCount: results.length,
                  separatorBuilder: (_, __) => const Divider(height: 1),
                  itemBuilder: (context, index) {
                    final result = results[index];
                    return ListTile(
                      dense: true,
                      leading: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.primaryAccent.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(
                          FeatherIcons.alertCircle,
                          size: 20,
                          color: AppColors.primaryAccent,
                        ),
                      ),
                      title: Text(
                        result.title,
                        style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      subtitle: Text(
                        result.locationTextRaw,
                        style: AppTextStyles.bodySmall,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      onTap: () {
                        _searchController.clear();
                        ref.read(searchQueryProvider.notifier).state = '';
                        setState(() => _showSearch = false);
                        _showIncidentDetails(context, result);
                      },
                    );
                  },
                ),
              );
            },
            loading: () => const Padding(
              padding: EdgeInsets.all(AppSpacing.medium),
              child: Center(child: CircularProgressIndicator()),
            ),
            error: (err, stack) => const SizedBox.shrink(),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsCards(AsyncValue<List<Incident>> incidents) {
    return incidents.when(
      data: (data) {
        if (data.isEmpty) return const SizedBox.shrink();
        
        final totalIncidents = data.length;
        final totalPersons = data.fold<int>(0, (sum, incident) => sum + incident.persons.length);
        final uniqueLocations = data.map((e) => e.locationTextRaw).toSet().length;

        return Padding(
          padding: const EdgeInsets.all(AppSpacing.medium),
          child: Row(
            children: [
              Expanded(child: _buildStatCard('Incidents', totalIncidents, FeatherIcons.alertCircle, AppColors.primaryAccent)),
              const SizedBox(width: AppSpacing.small),
              Expanded(child: _buildStatCard('Persons', totalPersons, FeatherIcons.users, AppColors.secondaryAccent)),
              const SizedBox(width: AppSpacing.small),
              Expanded(child: _buildStatCard('Locations', uniqueLocations, FeatherIcons.mapPin, AppColors.accent)),
            ],
          ),
        );
      },
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
    );
  }

  Widget _buildStatCard(String label, int value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.medium),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppSpacing.borderRadius),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: AppSpacing.small),
          Text(
            value.toString(),
            style: AppTextStyles.headlineMedium.copyWith(color: color),
          ),
          Text(
            label,
            style: AppTextStyles.bodySmall,
          ),
        ],
      ),
    );
  }

  Widget _buildGraphVisualization(AsyncValue<List<Incident>> incidents) {
    return incidents.when(
      data: (data) {
        if (data.isEmpty) {
          return SliverFillRemaining(
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    FeatherIcons.search,
                    size: 64,
                    color: AppColors.secondaryText.withOpacity(0.3),
                  ),
                  const SizedBox(height: AppSpacing.medium),
                  Text(
                    'No incidents found',
                    style: AppTextStyles.headlineMedium.copyWith(
                      color: AppColors.secondaryText,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.small),
                  Text(
                    'Try different search keywords',
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.secondaryText.withOpacity(0.7),
                    ),
                  ),
                ],
              ),
            ),
          );
        }

        final graph = Graph();
        final Map<String, dynamic> nodeData = {};
        
        // Create nodes for incidents and persons
        for (var incident in data) {
          final incidentNode = Node.Id(incident.id);
          nodeData[incident.id] = {'type': 'incident', 'data': incident};
          graph.addNode(incidentNode);

          for (var person in incident.persons) {
            final personNode = Node.Id(person.id);
            if (!nodeData.containsKey(person.id)) {
              nodeData[person.id] = {'type': 'person', 'data': person};
              graph.addNode(personNode);
            }
            graph.addEdge(incidentNode, personNode);
          }

          // Add location node if it doesn't exist
          final locationId = 'loc_${incident.locationTextRaw}';
          if (!nodeData.containsKey(locationId)) {
            final locationNode = Node.Id(locationId);
            nodeData[locationId] = {'type': 'location', 'data': incident.locationTextRaw};
            graph.addNode(locationNode);
          }
          graph.addEdge(Node.Id(incident.id), Node.Id(locationId));
        }

        final config = BuchheimWalkerConfiguration()
          ..siblingSeparation = 200
          ..levelSeparation = 200
          ..subtreeSeparation = 250
          ..orientation = BuchheimWalkerConfiguration.ORIENTATION_TOP_BOTTOM;

        final builder = BuchheimWalkerAlgorithm(
          config,
          TreeEdgeRenderer(config),
        );

        return SliverToBoxAdapter(
          child: Container(
            height: MediaQuery.of(context).size.height * 0.65,
            margin: const EdgeInsets.all(AppSpacing.medium),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(AppSpacing.borderRadius),
              boxShadow: [
                BoxShadow(
                  color: AppColors.shadow,
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(AppSpacing.borderRadius),
              child: InteractiveViewer(
                constrained: false,
                boundaryMargin: const EdgeInsets.all(200),
                minScale: 0.05,
                maxScale: 3.0,
                child: Container(
                  padding: const EdgeInsets.all(100),
                  child: GraphView(
                    graph: graph,
                    algorithm: builder,
                    paint: Paint()
                      ..color = AppColors.primaryAccent.withOpacity(0.3)
                      ..strokeWidth = 2
                      ..style = PaintingStyle.stroke,
                    builder: (Node node) {
                      final nodeInfo = nodeData[node.key!.value];
                      if (nodeInfo == null) return const SizedBox.shrink();
                      
                      return _buildGraphNode(nodeInfo['type'], nodeInfo['data']);
                    },
                  ),
                ),
              ),
            ),
          ),
        );
      },
      loading: () => const SliverFillRemaining(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: AppSpacing.medium),
              Text(
                'Loading incidents...',
                style: AppTextStyles.bodyMedium,
              ),
            ],
          ),
        ),
      ),
      error: (err, stack) => SliverFillRemaining(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                FeatherIcons.alertTriangle,
                size: 64,
                color: AppColors.negative,
              ),
              const SizedBox(height: AppSpacing.medium),
              Text(
                'Error loading data',
                style: AppTextStyles.headlineMedium.copyWith(color: AppColors.negative),
              ),
              const SizedBox(height: AppSpacing.small),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
                child: Text(
                  err.toString(),
                  style: AppTextStyles.bodyMedium,
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGraphNode(String type, dynamic data) {
    switch (type) {
      case 'incident':
        return _buildIncidentNode(data as Incident);
      case 'person':
        return _buildPersonNode(data as Person);
      case 'location':
        return _buildLocationNode(data as String);
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildIncidentNode(Incident incident) {
    return AnimatedBuilder(
      animation: _pulseController,
      builder: (context, child) {
        final scale = 1.0 + (math.sin(_pulseController.value * 2 * math.pi) * 0.05);
        return Transform.scale(
          scale: scale,
          child: child,
        );
      },
      child: GestureDetector(
        onTap: () => _showIncidentDetails(context, incident),
        child: Container(
          width: 140,
          height: 140,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                AppColors.primaryAccent,
                AppColors.primaryAccent.withOpacity(0.7),
              ],
            ),
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: AppColors.primaryAccent.withOpacity(0.3),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Stack(
            children: [
              Positioned(
                top: 8,
                right: 8,
                child: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    FeatherIcons.alertCircle,
                    size: 16,
                    color: Colors.white,
                  ),
                ),
              ),
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        FeatherIcons.activity,
                        color: Colors.white,
                        size: 32,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        incident.title,
                        style: AppTextStyles.bodySmall.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${incident.persons.length} persons',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: Colors.white.withOpacity(0.8),
                          fontSize: 10,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPersonNode(Person person) {
    return Container(
      width: 100,
      height: 100,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.secondaryAccent,
            AppColors.secondaryAccent.withOpacity(0.7),
          ],
        ),
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: AppColors.secondaryAccent.withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            FeatherIcons.user,
            color: Colors.white,
            size: 28,
          ),
          const SizedBox(height: 6),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Text(
              person.name,
              style: AppTextStyles.bodySmall.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 11,
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLocationNode(String location) {
    return Container(
      width: 110,
      height: 80,
      decoration: BoxDecoration(
        color: AppColors.accent,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.accent.withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            FeatherIcons.mapPin,
            color: AppColors.primaryText,
            size: 24,
          ),
          const SizedBox(height: 6),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Text(
              location,
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.primaryText,
                fontWeight: FontWeight.w600,
                fontSize: 10,
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  void _showIncidentDetails(BuildContext context, Incident incident) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (context, scrollController) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: ListView(
            controller: scrollController,
            padding: const EdgeInsets.all(AppSpacing.large),
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.divider,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.large),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.primaryAccent.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      FeatherIcons.alertCircle,
                      color: AppColors.primaryAccent,
                      size: 28,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.medium),
                  Expanded(
                    child: Text(
                      incident.title,
                      style: AppTextStyles.headlineMedium,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.large),
              _buildDetailRow(FeatherIcons.calendar, 'Date', 
                incident.incidentTimestamp.toString().split(' ')[0]),
              _buildDetailRow(FeatherIcons.mapPin, 'Location', incident.locationTextRaw),
              _buildDetailRow(FeatherIcons.navigation, 'Coordinates', 
                '${incident.latitude.toStringAsFixed(4)}, ${incident.longitude.toStringAsFixed(4)}'),
              if (incident.fullTextContent != null) ...[
                const SizedBox(height: AppSpacing.medium),
                const Text(
                  'Description',
                  style: AppTextStyles.headlineMedium,
                ),
                const SizedBox(height: AppSpacing.small),
                Text(
                  incident.fullTextContent!,
                  style: AppTextStyles.bodyMedium,
                ),
              ],
              if (incident.persons.isNotEmpty) ...[
                const SizedBox(height: AppSpacing.large),
                const Text(
                  'Related Persons',
                  style: AppTextStyles.headlineMedium,
                ),
                const SizedBox(height: AppSpacing.small),
                Wrap(
                  spacing: AppSpacing.small,
                  runSpacing: AppSpacing.small,
                  children: incident.persons.map((person) => Chip(
                    avatar: const Icon(FeatherIcons.user, size: 16),
                    label: Text(person.name),
                    backgroundColor: AppColors.secondaryAccent.withOpacity(0.1),
                  )).toList(),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.small),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: AppColors.secondaryAccent),
          const SizedBox(width: AppSpacing.small),
          Text(
            '$label: ',
            style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600),
          ),
          Expanded(
            child: Text(
              value,
              style: AppTextStyles.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptySearchState() {
    return SliverFillRemaining(
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              FeatherIcons.search,
              size: 80,
              color: AppColors.primaryAccent.withOpacity(0.2),
            ),
            const SizedBox(height: AppSpacing.large),
            Text(
              'Start Searching',
              style: AppTextStyles.headlineMedium.copyWith(
                color: AppColors.primaryText,
              ),
            ),
            const SizedBox(height: AppSpacing.small),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
              child: Text(
                'Use the search button to find incidents and create a dynamic graph visualization',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.secondaryText,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: AppSpacing.large),
            Container(
              padding: const EdgeInsets.all(AppSpacing.medium),
              margin: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
              decoration: BoxDecoration(
                color: AppColors.primaryAccent.withOpacity(0.1),
                borderRadius: BorderRadius.circular(AppSpacing.borderRadius),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    FeatherIcons.info,
                    size: 20,
                    color: AppColors.primaryAccent,
                  ),
                  const SizedBox(width: AppSpacing.small),
                  Flexible(
                    child: Text(
                      'Tap the search icon above to get started',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.primaryAccent,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
