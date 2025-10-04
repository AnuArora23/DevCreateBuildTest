import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:feather_icons/feather_icons.dart';
import '../../config/api_config.dart';
import '../../services/api_service.dart';
import '../../utils/theme.dart';

class ApiSettingsScreen extends ConsumerStatefulWidget {
  const ApiSettingsScreen({super.key});

  @override
  ConsumerState<ApiSettingsScreen> createState() => _ApiSettingsScreenState();
}

class _ApiSettingsScreenState extends ConsumerState<ApiSettingsScreen> {
  List<TextEditingController> _controllers = [];
  bool _isTesting = false;
  Map<String, bool?> _testResults = {}; // null = not tested, true = success, false = failed
  String? _workingUrl;

  @override
  void initState() {
    super.initState();
    _loadUrls();
  }

  void _loadUrls() {
    final urls = ApiConfig.apiUrls;
    _controllers = urls.map((url) => TextEditingController(text: url)).toList();
    _workingUrl = ApiConfig.API_BASE_URL;
  }

  @override
  void dispose() {
    for (var controller in _controllers) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _testAllUrls() async {
    setState(() {
      _isTesting = true;
      _testResults.clear();
      _workingUrl = null;
    });

    final apiService = ApiService();
    
    // Get URLs from text fields
    final urls = _controllers
        .map((c) => c.text.trim())
        .where((url) => url.isNotEmpty)
        .toList();

    for (var url in urls) {
      if (!mounted) break;
      
      setState(() {
        _testResults[url] = null; // Testing in progress
      });

      try {
        // Temporarily set this URL to test
        await ApiConfig.updateUrls([url, ...urls.where((u) => u != url)]);
        
        // Test the health endpoint
        final isHealthy = await apiService.checkHealth();
        
        if (!mounted) break;
        
        setState(() {
          _testResults[url] = isHealthy;
        });

        // If this URL works, set it as working and stop testing
        if (isHealthy) {
          await ApiConfig.setWorkingUrl(url);
          _workingUrl = url;
          
          if (!mounted) break;
          
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('✅ Connected to: $url'),
              backgroundColor: AppColors.positive,
            ),
          );
          break; // Stop testing once we find a working URL
        }
      } catch (e) {
        if (!mounted) break;
        
        setState(() {
          _testResults[url] = false;
        });
      }
    }

    // Restore all URLs
    final allUrls = _controllers
        .map((c) => c.text.trim())
        .where((url) => url.isNotEmpty)
        .toList();
    await ApiConfig.updateUrls(allUrls);

    if (mounted) {
      setState(() {
        _isTesting = false;
      });

      // If no URL worked, show error
      if (_workingUrl == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('❌ Could not connect to any API server'),
            backgroundColor: AppColors.negative,
          ),
        );
      }
    }
  }

  Future<void> _testSingleUrl(String url) async {
    setState(() {
      _testResults[url] = null; // Testing
    });

    final apiService = ApiService();
    
    try {
      // Temporarily set this URL
      final currentUrls = ApiConfig.apiUrls;
      await ApiConfig.updateUrls([url, ...currentUrls.where((u) => u != url)]);
      
      final isHealthy = await apiService.checkHealth();
      
      setState(() {
        _testResults[url] = isHealthy;
      });

      if (isHealthy) {
        await ApiConfig.setWorkingUrl(url);
        _workingUrl = url;
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('✅ Connected to: $url'),
              backgroundColor: AppColors.positive,
            ),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('❌ Cannot connect to: $url'),
              backgroundColor: AppColors.negative,
            ),
          );
        }
      }
      
      // Restore all URLs
      await ApiConfig.updateUrls(currentUrls);
    } catch (e) {
      setState(() {
        _testResults[url] = false;
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('❌ Error testing: $url'),
            backgroundColor: AppColors.negative,
          ),
        );
      }
    }
  }

  void _addNewUrl() {
    setState(() {
      _controllers.add(TextEditingController(text: 'http://'));
    });
  }

  void _removeUrl(int index) {
    if (_controllers.length > 1) {
      setState(() {
        _controllers[index].dispose();
        _controllers.removeAt(index);
      });
    }
  }

  Future<void> _saveUrls() async {
    final urls = _controllers
        .map((c) => c.text.trim())
        .where((url) => url.isNotEmpty)
        .toList();

    if (urls.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('⚠️ Please add at least one URL'),
          backgroundColor: AppColors.warning,
        ),
      );
      return;
    }

    await ApiConfig.updateUrls(urls);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('💾 API URLs saved'),
          backgroundColor: AppColors.positive,
        ),
      );
    }
  }

  Future<void> _resetToDefaults() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Reset to Defaults?'),
        content: const Text('This will restore the default API URLs.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Reset'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await ApiConfig.resetToDefaults();
      
      // Reload controllers
      for (var controller in _controllers) {
        controller.dispose();
      }
      
      setState(() {
        _loadUrls();
        _testResults.clear();
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('🔄 Reset to default URLs'),
            backgroundColor: AppColors.positive,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('API Settings'),
        actions: [
          IconButton(
            icon: const Icon(FeatherIcons.refreshCw),
            onPressed: _resetToDefaults,
            tooltip: 'Reset to defaults',
          ),
        ],
      ),
      body: Column(
        children: [
          // Info card
          Container(
            margin: const EdgeInsets.all(AppSpacing.screenPadding),
            padding: const EdgeInsets.all(AppSpacing.medium),
            decoration: BoxDecoration(
              color: AppColors.primaryAccent.withOpacity(0.1),
              borderRadius: BorderRadius.circular(AppSpacing.borderRadius),
              border: Border.all(
                color: AppColors.primaryAccent.withOpacity(0.3),
                width: 1,
              ),
            ),
            child: Row(
              children: [
                const Icon(
                  FeatherIcons.info,
                  color: AppColors.primaryAccent,
                  size: 20,
                ),
                const SizedBox(width: AppSpacing.small),
                Expanded(
                  child: Text(
                    'The app will try these URLs in order until one works',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.primaryText,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // URL list
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.screenPadding,
              ),
              itemCount: _controllers.length,
              itemBuilder: (context, index) {
                final controller = _controllers[index];
                final url = controller.text.trim();
                final testResult = _testResults[url];
                final isWorking = url == _workingUrl;

                return Card(
                  margin: const EdgeInsets.only(bottom: AppSpacing.medium),
                  child: Padding(
                    padding: const EdgeInsets.all(AppSpacing.medium),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              'URL ${index + 1}',
                              style: AppTextStyles.bodyMedium.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            if (isWorking) ...[
                              const SizedBox(width: AppSpacing.small),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.positive,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  'WORKING',
                                  style: AppTextStyles.bodySmall.copyWith(
                                    color: Colors.white,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                            const Spacer(),
                            if (_controllers.length > 1)
                              IconButton(
                                icon: const Icon(
                                  FeatherIcons.trash2,
                                  size: 18,
                                ),
                                onPressed: () => _removeUrl(index),
                                tooltip: 'Remove',
                                color: AppColors.negative,
                              ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.small),
                        TextField(
                          controller: controller,
                          decoration: InputDecoration(
                            hintText: 'http://localhost:8000',
                            prefixIcon: const Icon(
                              FeatherIcons.globe,
                              size: 20,
                            ),
                            suffixIcon: testResult == null
                                ? (url.isNotEmpty
                                    ? const SizedBox(
                                        width: 20,
                                        height: 20,
                                        child: Center(
                                          child: SizedBox(
                                            width: 16,
                                            height: 16,
                                            child: CircularProgressIndicator(
                                              strokeWidth: 2,
                                            ),
                                          ),
                                        ),
                                      )
                                    : null)
                                : Icon(
                                    testResult
                                        ? FeatherIcons.checkCircle
                                        : FeatherIcons.xCircle,
                                    color: testResult
                                        ? AppColors.positive
                                        : AppColors.negative,
                                    size: 20,
                                  ),
                          ),
                          onChanged: (value) {
                            // Clear test result when URL changes
                            setState(() {
                              _testResults.remove(url);
                            });
                          },
                        ),
                        const SizedBox(height: AppSpacing.small),
                        SizedBox(
                          width: double.infinity,
                          child: OutlinedButton.icon(
                            onPressed: url.isNotEmpty && !_isTesting
                                ? () => _testSingleUrl(url)
                                : null,
                            icon: const Icon(FeatherIcons.zap, size: 16),
                            label: const Text('Test This URL'),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // Bottom buttons
          Container(
            padding: const EdgeInsets.all(AppSpacing.screenPadding),
            decoration: BoxDecoration(
              color: AppColors.cardBackground,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -5),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _isTesting ? null : _testAllUrls,
                    icon: _isTesting
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Icon(FeatherIcons.playCircle),
                    label: Text(_isTesting
                        ? 'Testing URLs...'
                        : 'Test All URLs (Auto-Select)'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryAccent,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                        vertical: AppSpacing.medium,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: AppSpacing.small),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _addNewUrl,
                        icon: const Icon(FeatherIcons.plus, size: 18),
                        label: const Text('Add URL'),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.small),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: _saveUrls,
                        icon: const Icon(FeatherIcons.save, size: 18),
                        label: const Text('Save'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
