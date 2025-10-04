import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:feather_icons/feather_icons.dart';

import '../../providers/app_providers.dart';
import '../../utils/theme.dart';
import '../../models/osint_report.dart';
import '../../models/case_file.dart';
import '../case_file/case_file_screen.dart';

class ExploreScreen extends ConsumerStatefulWidget {
  const ExploreScreen({super.key});

  @override
  ConsumerState<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends ConsumerState<ExploreScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final searchQuery = ref.watch(searchQueryProvider);
    final searchReportsAsync = ref.watch(searchReportsProvider);
    final searchCaseFilesAsync = ref.watch(searchCaseFilesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Explore'),
        centerTitle: false,
      ),
      body: Column(
        children: [
          // Search Input
          Padding(
            padding: const EdgeInsets.all(AppSpacing.screenPadding),
            child: TextField(
              controller: _searchController,
              onChanged: (value) {
                ref.read(searchQueryProvider.notifier).state = value;
              },
              decoration: InputDecoration(
                hintText: 'Search locations, incidents, tags...',
                prefixIcon: const Icon(FeatherIcons.search),
                suffixIcon: searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(FeatherIcons.x),
                        onPressed: () {
                          _searchController.clear();
                          ref.read(searchQueryProvider.notifier).state = '';
                        },
                      )
                    : null,
              ),
            ),
          ),
          
          // Search Results
          Expanded(
            child: searchQuery.isEmpty
                ? _buildEmptyState()
                : _buildSearchResults(searchReportsAsync, searchCaseFilesAsync),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            FeatherIcons.search,
            color: AppColors.secondaryText,
            size: 64,
          ),
          SizedBox(height: AppSpacing.medium),
          Text(
            'Search GOSIP',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w600,
              color: AppColors.secondaryText,
            ),
          ),
          SizedBox(height: AppSpacing.small),
          Text(
            'Find reports, case files, and discussions',
            style: TextStyle(
              fontSize: 16,
              color: AppColors.secondaryText,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildSearchResults(
    AsyncValue<List<OsintReport>> searchReportsAsync,
    AsyncValue<List<CaseFile>> searchCaseFilesAsync,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.screenPadding),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Reports Section
          searchReportsAsync.when(
            data: (reports) => reports.isEmpty
                ? const SizedBox.shrink()
                : _buildReportsSection(reports),
            loading: () => const Center(
              child: Padding(
                padding: EdgeInsets.all(AppSpacing.medium),
                child: CircularProgressIndicator(color: AppColors.primaryAccent),
              ),
            ),
            error: (error, stackTrace) => const SizedBox.shrink(),
          ),
          
          const SizedBox(height: AppSpacing.large),
          
          // Case Files Section
          searchCaseFilesAsync.when(
            data: (caseFiles) => caseFiles.isEmpty
                ? const SizedBox.shrink()
                : _buildCaseFilesSection(caseFiles),
            loading: () => const Center(
              child: Padding(
                padding: EdgeInsets.all(AppSpacing.medium),
                child: CircularProgressIndicator(color: AppColors.primaryAccent),
              ),
            ),
            error: (error, stackTrace) => const SizedBox.shrink(),
          ),
        ],
      ),
    );
  }

  Widget _buildReportsSection(List<OsintReport> reports) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Reports (${reports.length})',
          style: AppTextStyles.headlineMedium,
        ),
        const SizedBox(height: AppSpacing.medium),
        ...reports.map((report) => Card(
          margin: const EdgeInsets.only(bottom: AppSpacing.small),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: ColorUtils.fromSentiment(report.sentimentLabel),
              radius: 12,
              child: const Icon(
                FeatherIcons.mapPin,
                color: Colors.white,
                size: 16,
              ),
            ),
            title: Text(
              report.content,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: AppTextStyles.bodyMedium,
            ),
            subtitle: Text(
              '${report.sourcePlatform ?? 'Unknown Source'} • ${report.latitude.toStringAsFixed(4)}, ${report.longitude.toStringAsFixed(4)}',
              style: AppTextStyles.labelSmall,
            ),
            trailing: Text(
              report.sentimentLabel ?? 'Neutral',
              style: AppTextStyles.labelSmall.copyWith(
                color: ColorUtils.fromSentiment(report.sentimentLabel),
                fontWeight: FontWeight.w600,
              ),
            ),
            onTap: () => _navigateToReportDetails(report),
          ),
        )).toList(),
      ],
    );
  }

  Widget _buildCaseFilesSection(List<CaseFile> caseFiles) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Case Files (${caseFiles.length})',
          style: AppTextStyles.headlineMedium,
        ),
        const SizedBox(height: AppSpacing.medium),
        ...caseFiles.map((caseFile) => Card(
          margin: const EdgeInsets.only(bottom: AppSpacing.small),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: ColorUtils.fromPriority(caseFile.priority),
              radius: 12,
              child: const Icon(
                FeatherIcons.folder,
                color: Colors.white,
                size: 16,
              ),
            ),
            title: Text(
              caseFile.title,
              style: AppTextStyles.bodyLarge,
            ),
            subtitle: Text(
              caseFile.summary,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AppTextStyles.bodyMedium,
            ),
            trailing: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  caseFile.priority,
                  style: AppTextStyles.labelSmall.copyWith(
                    color: ColorUtils.fromPriority(caseFile.priority),
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  caseFile.status,
                  style: AppTextStyles.labelSmall,
                ),
              ],
            ),
            onTap: () => _navigateToCaseFile(caseFile),
          ),
        )).toList(),
      ],
    );
  }

  void _navigateToReportDetails(OsintReport report) {
    // For now, find the case file for this report and navigate to it
    ref.read(caseFileByIdProvider(report.caseFileId).future).then((caseFile) {
      if (caseFile != null && mounted) {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => CaseFileScreen(caseFile: caseFile),
          ),
        );
      }
    });
  }

  void _navigateToCaseFile(CaseFile caseFile) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => CaseFileScreen(caseFile: caseFile),
      ),
    );
  }
}