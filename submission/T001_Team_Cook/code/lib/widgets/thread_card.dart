import 'package:flutter/material.dart';
import 'package:feather_icons/feather_icons.dart';
import 'package:intl/intl.dart';

import '../models/case_file.dart';
import '../utils/theme.dart';
import '../screens/case_file/case_file_screen.dart';

class ThreadCard extends StatelessWidget {
  final CaseFile caseFile;
  final int messageCount;
  final VoidCallback onTap;

  const ThreadCard({
    super.key,
    required this.caseFile,
    required this.messageCount,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final priorityColor = ColorUtils.fromPriority(caseFile.priority);
    final lastUpdated = DateTime.tryParse(caseFile.lastUpdated);
    final formattedDate = lastUpdated != null
        ? DateFormat('MMM d').format(lastUpdated)
        : '';

    return Card(
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.borderRadius),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppSpacing.borderRadius),
        child: Row(
          children: [
            SizedBox(
              width: 70,
              height: 120,
              child: InkWell(
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (context) => CaseFileScreen(caseFile: caseFile),
                    ),
                  );
                },
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(AppSpacing.borderRadius),
                  bottomLeft: Radius.circular(AppSpacing.borderRadius),
                ),
                child: Center(
                  child: CircleAvatar(
                    backgroundColor: AppColors.primaryAccent.withOpacity(0.1),
                    child: const Icon(
                      FeatherIcons.fileText,
                      color: AppColors.primaryAccent,
                      size: 20,
                    ),
                  ),
                ),
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(0, AppSpacing.medium, AppSpacing.medium, AppSpacing.medium),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header Row
                    Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: priorityColor,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: AppSpacing.small),
                        Expanded(
                          child: Text(
                            caseFile.title,
                            style: AppTextStyles.bodyLarge.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Text(
                          formattedDate,
                          style: AppTextStyles.labelSmall,
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.small),
                    
                    // Summary
                    Text(
                      caseFile.summary,
                      style: AppTextStyles.bodyMedium,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: AppSpacing.medium),
                    
                    // Footer Row
                    Row(
                      children: [
                        // Participant count
                        _buildParticipantCount(messageCount),
                        const Spacer(),
                        
                        // Message count
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: AppSpacing.small,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.primaryAccent.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                FeatherIcons.messageSquare,
                                size: 12,
                                color: AppColors.primaryAccent,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                '$messageCount',
                                style: AppTextStyles.labelSmall.copyWith(
                                  color: AppColors.primaryAccent,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
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

  Widget _buildParticipantCount(int count) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.small,
        vertical: 2,
      ),
      decoration: BoxDecoration(
        color: AppColors.neutral.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            FeatherIcons.users,
            size: 12,
            color: AppColors.neutral,
          ),
          const SizedBox(width: 4),
          Text(
            '$count',
            style: AppTextStyles.labelSmall.copyWith(
              color: AppColors.neutral,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}