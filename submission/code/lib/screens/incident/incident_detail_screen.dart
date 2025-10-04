import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:feather_icons/feather_icons.dart';
import 'package:intl/intl.dart';
import 'package:gosip/models/incident.dart';
import 'package:gosip/utils/theme.dart';

class IncidentDetailScreen extends ConsumerWidget {
  final Incident incident;

  const IncidentDetailScreen({super.key, required this.incident});

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
                incident.title,
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
                      Colors.purple.withOpacity(0.1),
                      AppColors.scaffoldBackground,
                    ],
                  ),
                ),
                child: const Center(
                  child: Icon(
                    FeatherIcons.alertTriangle,
                    size: 64,
                    color: Colors.purple,
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
                    _buildMetadataSection(),
                    const SizedBox(height: AppSpacing.large),
                    if (incident.fullTextContent != null)
                      _buildFullTextSection(),
                    const SizedBox(height: AppSpacing.large),
                    _buildEvidenceSection(),
                  ],
                ),
              ),
            ]),
          ),
        ],
      ),
    );
  }

  Widget _buildMetadataSection() {
    final formattedIncidentDate = DateFormat('MMM d, y • h:mm a').format(incident.incidentTimestamp);

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
                  color: Colors.purple,
                  size: 20,
                ),
                const SizedBox(width: AppSpacing.small),
                Text(
                  'Incident Details',
                  style: AppTextStyles.bodyLarge.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.medium),
            _buildMetadataRow(
              FeatherIcons.clock,
              'Incident Date',
              formattedIncidentDate,
            ),
            const SizedBox(height: AppSpacing.small),
            _buildMetadataRow(
              FeatherIcons.mapPin,
              'Location',
              incident.locationTextRaw,
            ),
            const SizedBox(height: AppSpacing.small),
            _buildMetadataRow(
              FeatherIcons.compass,
              'Coordinates',
              '${incident.latitude.toStringAsFixed(4)}, ${incident.longitude.toStringAsFixed(4)}',
            ),
            const SizedBox(height: AppSpacing.small),
            _buildMetadataRow(
              FeatherIcons.shield,
              'Location Confidence',
              incident.locationConfidence,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetadataRow(IconData icon, String label, String value) {
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
              color: AppColors.secondaryText,
            ),
            textAlign: TextAlign.end,
          ),
        ),
      ],
    );
  }

  Widget _buildFullTextSection() {
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
                  color: Colors.purple,
                  size: 20,
                ),
                const SizedBox(width: AppSpacing.small),
                Text(
                  'Full Report',
                  style: AppTextStyles.bodyLarge.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.medium),
            Text(
              incident.fullTextContent!,
              style: AppTextStyles.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEvidenceSection() {
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
                  color: Colors.purple,
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
            Center(
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.medium),
                child: Column(
                  children: [
                    const Icon(
                      FeatherIcons.archive,
                      color: AppColors.secondaryText,
                      size: 32,
                    ),
                    const SizedBox(height: AppSpacing.small),
                    Text(
                      'No evidence available for this incident yet.',
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.secondaryText,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
