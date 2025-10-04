import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:feather_icons/feather_icons.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';

import '../../models/case_file.dart';
import '../../providers/app_providers.dart';
import '../../utils/theme.dart';
import '../../widgets/thread_card.dart';
import '../case_file/chat_screen.dart';
import '../profile/profile_screen.dart';
import '../upload/upload_screen.dart';

class GossipScreen extends ConsumerWidget {
  const GossipScreen({super.key});

  void _navigateToProfile(BuildContext context) {
    Navigator.of(context).push(MaterialPageRoute(builder: (context) => const ProfileScreen()));
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final caseFilesAsync = ref.watch(caseFilesWithMessageCountsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Discussions'),
        centerTitle: false,
        actions: [
          IconButton(
            icon: const Icon(FeatherIcons.refreshCw),
            onPressed: () {
              ref.invalidate(caseFilesWithMessageCountsProvider);
            },
          ),
          IconButton(
            icon: const Icon(FeatherIcons.user),
            onPressed: () => _navigateToProfile(context),
          ),
        ],
      ),
      body: caseFilesAsync.when(
        data: (caseFilesData) => _buildCaseFilesList(context, ref, caseFilesData),
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppColors.primaryAccent),
        ),
        error: (error, stackTrace) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                FeatherIcons.alertCircle,
                color: AppColors.negative,
                size: 48,
              ),
              const SizedBox(height: AppSpacing.medium),
              Text(
                'Failed to load discussions',
                style: AppTextStyles.bodyLarge,
              ),
              const SizedBox(height: AppSpacing.small),
              Text(
                error.toString(),
                style: AppTextStyles.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppSpacing.medium),
              ElevatedButton(
                onPressed: () {
                  ref.invalidate(caseFilesWithMessageCountsProvider);
                },
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.of(context).push(MaterialPageRoute(builder: (context) => const UploadScreen()));
        },
        child: const Icon(FeatherIcons.plus),
      ),
    );
  }

  Widget _buildCaseFilesList(BuildContext context, WidgetRef ref, List<Map<String, dynamic>> caseFilesData) {
    if (caseFilesData.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              FeatherIcons.messageSquare,
              color: AppColors.secondaryText,
              size: 64,
            ),
            const SizedBox(height: AppSpacing.medium),
            Text(
              'No discussions yet',
              style: AppTextStyles.headlineMedium.copyWith(
                color: AppColors.secondaryText,
              ),
            ),
            const SizedBox(height: AppSpacing.small),
            Text(
              'Discussions will appear as cases are investigated',
              style: AppTextStyles.bodyMedium,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(caseFilesWithMessageCountsProvider);
      },
      child: AnimationLimiter(
        child: ListView.builder(
          padding: const EdgeInsets.all(AppSpacing.screenPadding),
          itemCount: caseFilesData.length,
          itemBuilder: (context, index) {
            final data = caseFilesData[index];
            final caseFile = CaseFile.fromMap(data);
            final messageCount = data['message_count'] as int? ?? 0;
            
            return AnimationConfiguration.staggeredList(
              position: index,
              duration: const Duration(milliseconds: 375),
              child: SlideAnimation(
                verticalOffset: 50.0,
                child: FadeInAnimation(
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: AppSpacing.medium),
                    child: ThreadCard(
                      caseFile: caseFile,
                      messageCount: messageCount,
                      onTap: () => _navigateToChat(context, caseFile),
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  void _navigateToChat(BuildContext context, CaseFile caseFile) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => ChatScreen(caseFile: caseFile),
      ),
    );
  }
}