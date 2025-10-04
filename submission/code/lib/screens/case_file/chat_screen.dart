import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:feather_icons/feather_icons.dart';
import 'package:intl/intl.dart';

import '../../models/case_file.dart';
import '../../models/gossip_message.dart';
import '../../providers/app_providers.dart';
import '../../utils/theme.dart';
import 'case_file_screen.dart';

class ChatScreen extends ConsumerStatefulWidget {
  final CaseFile caseFile;

  const ChatScreen({
    super.key,
    required this.caseFile,
  });

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    final messageText = _messageController.text.trim();
    if (messageText.isEmpty) return;

    final messageNotifier = ref.read(
      messageNotifierProvider(widget.caseFile.caseFileId).notifier,
    );

    messageNotifier.addMessage('You', messageText);
    _messageController.clear();

    // Scroll to bottom after sending message
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _navigateToCaseFile() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => CaseFileScreen(caseFile: widget.caseFile),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final messagesAsync = ref.watch(
      messageNotifierProvider(widget.caseFile.caseFileId),
    );

    return Scaffold(
      appBar: AppBar(
        title: GestureDetector(
          onTap: _navigateToCaseFile,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                widget.caseFile.title,
                style: AppTextStyles.bodyLarge.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                'Case Discussion',
                style: AppTextStyles.labelSmall,
              ),
            ],
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(FeatherIcons.info),
            onPressed: () {
              _showCaseInfo();
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Messages List
          Expanded(
            child: messagesAsync.when(
              data: (messages) => _buildMessagesList(messages),
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
                      'Failed to load messages',
                      style: AppTextStyles.bodyLarge,
                    ),
                  ],
                ),
              ),
            ),
          ),
          
          // Message Input
          _buildMessageInput(),
        ],
      ),
    );
  }

  Widget _buildMessagesList(List<GossipMessage> messages) {
    if (messages.isEmpty) {
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
              'No messages yet',
              style: AppTextStyles.headlineMedium.copyWith(
                color: AppColors.secondaryText,
              ),
            ),
            const SizedBox(height: AppSpacing.small),
            Text(
              'Be the first to share your thoughts',
              style: AppTextStyles.bodyMedium,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(AppSpacing.medium),
      itemCount: messages.length,
      itemBuilder: (context, index) {
        final message = messages[index];
        final isOwnMessage = message.username == 'You';
        
        return Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.small),
          child: _buildMessageBubble(message, isOwnMessage),
        );
      },
    );
  }

  Widget _buildMessageBubble(GossipMessage message, bool isOwnMessage) {
    final timestamp = DateTime.tryParse(message.timestamp);
    final formattedTime = timestamp != null
        ? DateFormat('h:mm a').format(timestamp)
        : '';

    return Row(
      mainAxisAlignment: isOwnMessage
          ? MainAxisAlignment.end
          : MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (!isOwnMessage) ...[
          CircleAvatar(
            radius: 16,
            backgroundColor: AppColors.lightGray,
            child: Text(
              message.username[0].toUpperCase(),
              style: AppTextStyles.labelSmall.copyWith(
                fontWeight: FontWeight.w600,
                color: AppColors.primaryText,
              ),
            ),
          ),
          const SizedBox(width: AppSpacing.small),
        ],
        
        Flexible(
          child: Column(
            crossAxisAlignment: isOwnMessage
                ? CrossAxisAlignment.end
                : CrossAxisAlignment.start,
            children: [
              if (!isOwnMessage) ...[
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      message.username,
                      style: AppTextStyles.labelSmall.copyWith(
                        fontWeight: FontWeight.w600,
                        color: AppColors.primaryAccent,
                      ),
                    ),
                    if (message.isVerified) ...[
                      const SizedBox(width: 4),
                      const Icon(
                        FeatherIcons.checkCircle,
                        size: 12,
                        color: AppColors.positive,
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 4),
              ],
              
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.medium,
                  vertical: AppSpacing.small,
                ),
                decoration: BoxDecoration(
                  color: isOwnMessage
                      ? AppColors.primaryAccent
                      : AppColors.lightGray,
                  borderRadius: BorderRadius.circular(AppSpacing.borderRadius),
                ),
                child: Text(
                  message.messageText,
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: isOwnMessage
                        ? Colors.white
                        : AppColors.primaryText,
                  ),
                ),
              ),
              
              const SizedBox(height: 4),
              
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    formattedTime,
                    style: AppTextStyles.labelSmall.copyWith(
                      fontSize: 10,
                    ),
                  ),
                  if (message.upvotes > 0) ...[
                    const SizedBox(width: AppSpacing.small),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          FeatherIcons.thumbsUp,
                          size: 10,
                          color: AppColors.positive,
                        ),
                        const SizedBox(width: 2),
                        Text(
                          '${message.upvotes}',
                          style: AppTextStyles.labelSmall.copyWith(
                            fontSize: 10,
                            color: AppColors.positive,
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
        
        if (isOwnMessage) ...[
          const SizedBox(width: AppSpacing.small),
          CircleAvatar(
            radius: 16,
            backgroundColor: AppColors.primaryAccent,
            child: const Icon(
              FeatherIcons.user,
              size: 16,
              color: Colors.white,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildMessageInput() {
    return Container(
      padding: EdgeInsets.fromLTRB(
        AppSpacing.medium,
        AppSpacing.small,
        AppSpacing.medium,
        AppSpacing.medium + MediaQuery.of(context).padding.bottom,
      ),
      decoration: const BoxDecoration(
        color: AppColors.cardBackground,
        border: Border(
          top: BorderSide(color: AppColors.divider),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _messageController,
              decoration: const InputDecoration(
                hintText: 'Type a message...',
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(
                  horizontal: AppSpacing.medium,
                  vertical: AppSpacing.small,
                ),
              ),
              maxLines: null,
              textInputAction: TextInputAction.send,
              onSubmitted: (_) => _sendMessage(),
            ),
          ),
          const SizedBox(width: AppSpacing.small),
          IconButton(
            onPressed: _sendMessage,
            icon: const Icon(
              FeatherIcons.send,
              color: AppColors.primaryAccent,
            ),
            style: IconButton.styleFrom(
              backgroundColor: AppColors.primaryAccent.withOpacity(0.1),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppSpacing.borderRadius),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showCaseInfo() {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(AppSpacing.medium),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Case Information',
              style: AppTextStyles.headlineMedium,
            ),
            const SizedBox(height: AppSpacing.medium),
            Text(
              widget.caseFile.title,
              style: AppTextStyles.bodyLarge.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: AppSpacing.small),
            Text(
              widget.caseFile.summary,
              style: AppTextStyles.bodyMedium,
            ),
            const SizedBox(height: AppSpacing.medium),
            Row(
              children: [
                _buildInfoChip('Priority', widget.caseFile.priority),
                const SizedBox(width: AppSpacing.small),
                _buildInfoChip('Status', widget.caseFile.status),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoChip(String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.small,
        vertical: 4,
      ),
      decoration: BoxDecoration(
        color: AppColors.lightGray,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        '$label: $value',
        style: AppTextStyles.labelSmall,
      ),
    );
  }
}
