import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:feather_icons/feather_icons.dart';
import 'package:intl/intl.dart';

import '../models/case_file.dart';
import '../providers/app_providers.dart';
import '../utils/theme.dart';
import '../screens/case_file/case_file_screen.dart';

class AlertBottomSheet extends ConsumerWidget {
  final CaseFile caseFile;

  const AlertBottomSheet({
    super.key,
    required this.caseFile,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(AppSpacing.borderRadius),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Container(
            margin: const EdgeInsets.only(top: AppSpacing.small),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.lightGray,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          
          Padding(
            padding: const EdgeInsets.all(AppSpacing.screenPadding),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(),
                const SizedBox(height: AppSpacing.medium),
                _buildContent(),
                const SizedBox(height: AppSpacing.medium),
                _buildMetadata(),
                const SizedBox(height: AppSpacing.large),
                _buildActionButtons(context, ref),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    final sentimentColor = ColorUtils.fromSentiment(caseFile.sentimentLabel);
    
    return Row(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: sentimentColor,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: AppSpacing.small),
        Text(
          caseFile.primarySource ?? 'Unknown Source',
          style: AppTextStyles.labelSmall.copyWith(
            color: AppColors.primaryAccent,
            fontWeight: FontWeight.w600,
          ),
        ),
        const Spacer(),
        Icon(
          FeatherIcons.mapPin,
          size: 16,
          color: AppColors.secondaryText,
        ),
        const SizedBox(width: 4),
        Text(
          '${caseFile.latitude.toStringAsFixed(4)}, ${caseFile.longitude.toStringAsFixed(4)}',
          style: AppTextStyles.labelSmall,
        ),
      ],
    );
  }

  Widget _buildContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          caseFile.title,
          style: AppTextStyles.headlineMedium.copyWith(
            fontSize: 18,
          ),
        ),
        const SizedBox(height: AppSpacing.small),
        Text(
          caseFile.summary,
          style: AppTextStyles.bodyMedium,
          maxLines: 4,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }

  Widget _buildMetadata() {
    final dateTime = DateTime.tryParse(caseFile.firstReported);
    final formattedDate = dateTime != null 
        ? DateFormat('MMM d, y • h:mm a').format(dateTime)
        : caseFile.firstReported;
    
    return Column(
      children: [
        Row(
          children: [
            Icon(
              FeatherIcons.clock,
              size: 16,
              color: AppColors.secondaryText,
            ),
            const SizedBox(width: AppSpacing.small),
            Text(
              formattedDate,
              style: AppTextStyles.labelSmall,
            ),
            const Spacer(),
          ],
        ),
        if (caseFile.tags.isNotEmpty) ...[
          const SizedBox(height: AppSpacing.small),
          _buildTagsRow(),
        ],
      ],
    );
  }

  Widget _buildTagsRow() {
    return Row(
      children: [
        Icon(
          FeatherIcons.tag,
          size: 16,
          color: AppColors.secondaryText,
        ),
        const SizedBox(width: AppSpacing.small),
        Expanded(
          child: Wrap(
            spacing: AppSpacing.small,
            children: caseFile.tags.take(3).map((tag) {
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
                    fontSize: 10,
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildActionButtons(BuildContext context, WidgetRef ref) {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () {
              // Flag as suspicious functionality
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Report flagged for review'),
                  duration: Duration(seconds: 2),
                ),
              );
              Navigator.pop(context);
            },
            icon: const Icon(FeatherIcons.flag, size: 16),
            label: const Text('Flag'),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.negative,
              side: const BorderSide(color: AppColors.negative),
            ),
          ),
        ),
        const SizedBox(width: AppSpacing.medium),
        Expanded(
          flex: 2,
          child: ElevatedButton.icon(
            onPressed: () {
              Navigator.pop(context);
              _navigateToCaseFile(context, ref);
            },
            icon: const Icon(FeatherIcons.search, size: 16),
            label: const Text('Investigate Case File'),
          ),
        ),
      ],
    );
  }

  void _navigateToCaseFile(BuildContext context, WidgetRef ref) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => CaseFileScreen(caseFile: caseFile),
      ),
    );
  }
}