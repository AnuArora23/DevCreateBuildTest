import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:feather_icons/feather_icons.dart';
import '../../utils/theme.dart';
import '../main_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  void _nextPage() {
    if (_currentPage < 2) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _requestLocationPermission() async {
    final status = await Permission.location.request();
    if (status.isGranted) {
      // Navigate to main screen
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const MainScreen()),
        );
      }
    } else {
      // Show error or continue anyway for demo
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (context) => const MainScreen()),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      body: SafeArea(
        child: Stack(
          children: [
            Column(
              children: [
                Expanded(
                  child: PageView(
                    controller: _pageController,
                    onPageChanged: (page) {
                      setState(() {
                        _currentPage = page;
                      });
                    },
                    children: [
                      _buildWelcomePage(),
                      _buildLiveMapPage(),
                      _buildLocationPermissionPage(),
                    ],
                  ),
                ),
                _buildPageIndicator(),
                const SizedBox(height: AppSpacing.xl),
              ],
            ),
            Positioned(
              top: 16,
              right: 16,
              child: IconButton(
                icon: const Icon(FeatherIcons.x),
                onPressed: () {
                  Navigator.of(context).pushReplacement(
                    MaterialPageRoute(builder: (context) => const MainScreen()),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWelcomePage() {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.screenPadding),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // App Logo Placeholder
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              color: AppColors.primaryAccent,
              borderRadius: BorderRadius.circular(AppSpacing.borderRadius),
            ),
            child: const Icon(
              FeatherIcons.shield,
              color: Colors.white,
              size: 60,
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          
          Text(
            'Welcome to GOSIP',
            style: AppTextStyles.displayLarge,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.medium),
          
          Text(
            'Your interactive dashboard for community safety and awareness.',
            style: AppTextStyles.bodyLarge.copyWith(
              color: AppColors.secondaryText,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.xxl),
          
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _nextPage,
              child: const Text('Get Started'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLiveMapPage() {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.screenPadding),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Animated Map Graphic Placeholder
          Container(
            width: double.infinity,
            height: 240,
            margin: const EdgeInsets.symmetric(horizontal: AppSpacing.medium),
            decoration: BoxDecoration(
              color: AppColors.cardBackground,
              borderRadius: BorderRadius.circular(AppSpacing.borderRadius),
              boxShadow: [
                BoxShadow(
                  color: AppColors.shadow,
                  blurRadius: 8,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Stack(
              children: [
                // Map background
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.lightGray.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(AppSpacing.borderRadius),
                  ),
                ),
                // Animated pins
                Positioned(
                  top: 60,
                  left: 80,
                  child: _buildAnimatedPin(AppColors.negative),
                ),
                Positioned(
                  top: 120,
                  right: 100,
                  child: _buildAnimatedPin(AppColors.neutral),
                ),
                Positioned(
                  bottom: 80,
                  left: 120,
                  child: _buildAnimatedPin(AppColors.positive),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          
          Text(
            'Discover Real-Time Alerts',
            style: AppTextStyles.displayLarge,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.medium),
          
          Text(
            'GOSIP\'s map shows you publicly reported events and OSINT alerts as they happen in your vicinity.',
            style: AppTextStyles.bodyLarge.copyWith(
              color: AppColors.secondaryText,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.xxl),
          
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _nextPage,
              child: const Text('Continue'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLocationPermissionPage() {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.screenPadding),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Location Icon
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              color: AppColors.primaryAccent.withOpacity(0.1),
              borderRadius: BorderRadius.circular(AppSpacing.borderRadius),
            ),
            child: const Icon(
              FeatherIcons.mapPin,
              color: AppColors.primaryAccent,
              size: 60,
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          
          Text(
            'Enable Your Live Map',
            style: AppTextStyles.displayLarge,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.medium),
          
          Text(
            'GOSIP needs your location to center the map and show you the most relevant alerts. Your location is never shared.',
            style: AppTextStyles.bodyLarge.copyWith(
              color: AppColors.secondaryText,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.xxl),
          
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _requestLocationPermission,
              child: const Text('Grant Permission'),
            ),
          ),
          const SizedBox(height: AppSpacing.medium),
          
          TextButton(
            onPressed: () {
              // Continue without location for demo
              Navigator.of(context).pushReplacement(
                MaterialPageRoute(builder: (context) => const MainScreen()),
              );
            },
            child: const Text('Continue without location'),
          ),
        ],
      ),
    );
  }

  Widget _buildAnimatedPin(Color color) {
    return TweenAnimationBuilder<double>(
      duration: const Duration(seconds: 2),
      tween: Tween<double>(begin: 0.8, end: 1.2),
      builder: (context, scale, child) {
        return Transform.scale(
          scale: scale,
          child: Container(
            width: 16,
            height: 16,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: color.withOpacity(0.4),
                  blurRadius: 8,
                  spreadRadius: 2,
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildPageIndicator() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(3, (index) {
        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 4),
          width: _currentPage == index ? 24 : 8,
          height: 8,
          decoration: BoxDecoration(
            color: _currentPage == index
                ? AppColors.primaryAccent
                : AppColors.lightGray,
            borderRadius: BorderRadius.circular(4),
          ),
        );
      }),
    );
  }
}