import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:feather_icons/feather_icons.dart';
import 'package:intl/intl.dart';

import '../../models/case_file.dart';
import '../../providers/app_providers.dart';
import '../../utils/theme.dart';
import 'chat_screen.dart';

class CaseFileScreen extends ConsumerWidget {
  final CaseFile caseFile;

  const CaseFileScreen({
    super.key,
    required this.caseFile,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 200,
            floating: false,
            pinned: true,
            backgroundColor: AppColors.scaffoldBackground,
            foregroundColor: AppColors.primaryText,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                caseFile.title,
                style: AppTextStyles.bodyLarge.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppColors.primaryText,
                ),
              ),
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      AppColors.primaryAccent.withOpacity(0.1),
                      AppColors.scaffoldBackground,
                    ],
                  ),
                ),
                child: const Center(
                  child: Icon(
                    FeatherIcons.folder,
                    size: 64,
                    color: AppColors.primaryAccent,
                  ),
                ),
              ),
            ),
          ),
          SliverList(
            delegate: SliverChildListDelegate([
              Padding(
                padding: const EdgeInsets.all(AppSpacing.screenPadding),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildSnapshotSection(),
                    const SizedBox(height: AppSpacing.large),
                    _buildMetadataSection(),
                    const SizedBox(height: AppSpacing.large),
                    _buildActionsSection(context),
                    const SizedBox(height: AppSpacing.large),
                    _buildConnectedReportsSection(),
                    const SizedBox(height: AppSpacing.large),
                    _buildEvidenceLockerSection(),
                  ],
                ),
              ),
            ]),
          ),
        ],
      ),
    );
  }

  Widget _buildSnapshotSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.medium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(
                  FeatherIcons.fileText,
                  color: AppColors.primaryAccent,
                  size: 20,
                ),
                const SizedBox(width: AppSpacing.small),
                Text(
                  'Case Summary',
                  style: AppTextStyles.bodyLarge.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.medium),
            Text(
              caseFile.summary,
              style: AppTextStyles.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetadataSection() {
    final firstReported = DateTime.tryParse(caseFile.firstReported);
    final lastUpdated = DateTime.tryParse(caseFile.lastUpdated);
    
    final formattedFirst = firstReported != null
        ? DateFormat('MMM d, y • h:mm a').format(firstReported)
        : caseFile.firstReported;
    
    final formattedLast = lastUpdated != null
        ? DateFormat('MMM d, y • h:mm a').format(lastUpdated)
        : caseFile.lastUpdated;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.medium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(
                  FeatherIcons.info,
                  color: AppColors.primaryAccent,
                  size: 20,
                ),
                const SizedBox(width: AppSpacing.small),
                Text(
                  'Case Details',
                  style: AppTextStyles.bodyLarge.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.medium),
            
            _buildMetadataRow(
              FeatherIcons.clock,
              'First Reported',
              formattedFirst,
            ),
            const SizedBox(height: AppSpacing.small),
            
            _buildMetadataRow(
              FeatherIcons.refreshCw,
              'Last Updated',
              formattedLast,
            ),
            const SizedBox(height: AppSpacing.small),
            
            _buildMetadataRow(
              FeatherIcons.mapPin,
              'Location',
              '${caseFile.latitude.toStringAsFixed(4)}, ${caseFile.longitude.toStringAsFixed(4)}',
            ),
            const SizedBox(height: AppSpacing.small),
            
            _buildMetadataRow(
              FeatherIcons.flag,
              'Priority',
              caseFile.priority,
              valueColor: ColorUtils.fromPriority(caseFile.priority),
            ),
            const SizedBox(height: AppSpacing.small),
            
            _buildMetadataRow(
              FeatherIcons.activity,
              'Status',
              caseFile.status,
            ),
            
            if (caseFile.tags.isNotEmpty) ...[
              const SizedBox(height: AppSpacing.small),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(
                    FeatherIcons.tag,
                    size: 16,
                    color: AppColors.secondaryText,
                  ),
                  const SizedBox(width: AppSpacing.small),
                  Text(
                    'Tags',
                    style: AppTextStyles.bodyMedium.copyWith(
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.small),
                  Expanded(
                    child: Wrap(
                      spacing: AppSpacing.small,
                      children: caseFile.tags.map((tag) {
                        return Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.small,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.primaryAccent.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            tag,
                            style: AppTextStyles.labelSmall.copyWith(
                              color: AppColors.primaryAccent,
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildMetadataRow(
    IconData icon,
    String label,
    String value, {
    Color? valueColor,
  }) {
    return Row(
      children: [
        Icon(
          icon,
          size: 16,
          color: AppColors.secondaryText,
        ),
        const SizedBox(width: AppSpacing.small),
        Text(
          label,
          style: AppTextStyles.bodyMedium.copyWith(
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(width: AppSpacing.small),
        Expanded(
          child: Text(
            value,
            style: AppTextStyles.bodyMedium.copyWith(
              color: valueColor ?? AppColors.secondaryText,
            ),
            textAlign: TextAlign.end,
          ),
        ),
      ],
    );
  }

  Widget _buildActionsSection(BuildContext context) {
    return Row(
      children: [
        Expanded(
          flex: 2,
          child: ElevatedButton.icon(
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => ChatScreen(caseFile: caseFile),
                ),
              );
            },
            icon: const Icon(FeatherIcons.messageSquare, size: 16),
            label: const Text('Join Discussion'),
          ),
        ),
        const SizedBox(width: AppSpacing.medium),
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Case flagged as suspicious'),
                  duration: Duration(seconds: 2),
                ),
              );
            },
            icon: const Icon(FeatherIcons.flag, size: 16),
            label: const Text('Flag'),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.negative,
              side: const BorderSide(color: AppColors.negative),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildConnectedReportsSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.medium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(
                  FeatherIcons.link,
                  color: AppColors.primaryAccent,
                  size: 20,
                ),
                const SizedBox(width: AppSpacing.small),
                Text(
                  'Connected Reports',
                  style: AppTextStyles.bodyLarge.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.medium),
            
            Text(
              'This case file aggregates multiple related reports and intelligence sources.',
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.secondaryText,
              ),
            ),
            const SizedBox(height: AppSpacing.small),
            
            Row(
              children: [
                const Icon(
                  FeatherIcons.fileText,
                  size: 16,
                  color: AppColors.secondaryText,
                ),
                const SizedBox(width: AppSpacing.small),
                Text(
                  '${caseFile.reportCount} connected reports',
                  style: AppTextStyles.bodyMedium,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEvidenceLockerSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.medium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(
                  FeatherIcons.archive,
                  color: AppColors.primaryAccent,
                  size: 20,
                ),
                const SizedBox(width: AppSpacing.small),
                Text(
                  'Evidence Locker',
                  style: AppTextStyles.bodyLarge.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.medium),
            if (caseFile.evidence.isEmpty)
              Text(
                'No evidence available.',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.secondaryText,
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: caseFile.evidence.length,
                itemBuilder: (context, index) {
                  final evidence = caseFile.evidence[index];
                  return Card(
                    margin: const EdgeInsets.only(bottom: AppSpacing.medium),
                    child: Padding(
                      padding: const EdgeInsets.all(AppSpacing.medium),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            evidence.description ?? 'No description',
                            style: AppTextStyles.bodyMedium,
                          ),
                          const SizedBox(height: AppSpacing.small),
                          Row(
                            children: [
                              const Icon(
                                FeatherIcons.link,
                                size: 16,
                                color: AppColors.secondaryText,
                              ),
                              const SizedBox(width: AppSpacing.small),
                              Expanded(
                                child: Text(
                                  evidence.sourceUrl ?? 'No source',
                                  style: AppTextStyles.bodySmall.copyWith(
                                    color: AppColors.secondaryText,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}