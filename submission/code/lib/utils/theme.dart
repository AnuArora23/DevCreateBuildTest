import 'package:flutter/material.dart';

class AppColors {
  // Primary Colors (Soft Palette)
  static const Color scaffoldBackground = Color(0xFFFFFAFA); // Snow
  static const Color cardBackground = Color(0xFFFFF0F5);     // Lavender Blush
  static const Color primaryAccent = Color(0xFFFF69B4);      // Hot Pink
  static const Color secondaryAccent = Color(0xFFBA55D3);   // Medium Orchid
  static const Color accent = Color(0xFFD8BFD8);            // Thistle
  static const Color inputFill = Color(0xFFF8F8FF);        // Ghost White

  // Text Colors
  static const Color primaryText = Color(0xFF4B0082);      // Indigo
  static const Color secondaryText = Color(0xFF663399);    // Rebecca Purple

  // Sentiment & Status Colors
  static const Color negative = Color(0xFFDB7093); // Pale Violet Red
  static const Color neutral = Color(0xFFDAA520); // Goldenrod
  static const Color positive = Color(0xFF98FB98); // Pale Green

  // Additional UI Colors
  static const Color lightGray = Color(0xFFD3D3D3);
  static const Color divider = Color(0xFFD3D3D3);
  static const Color shadow = Color(0x1A000000); // A bit darker shadow
}

class AppTextStyles {
  // Font family: Inter (using system default for now)
  static const String fontFamily = 'Inter';
  
  // Display Large (Screen Titles): Inter SemiBold, 32sp
  static const TextStyle displayLarge = TextStyle(
    fontFamily: fontFamily,
    fontSize: 32,
    fontWeight: FontWeight.w600,
    color: AppColors.primaryText,
    height: 1.2,
  );
  
  // Headline Medium (Card Titles): Inter SemiBold, 22sp
  static const TextStyle headlineMedium = TextStyle(
    fontFamily: fontFamily,
    fontSize: 22,
    fontWeight: FontWeight.w600,
    color: AppColors.primaryText,
    height: 1.3,
  );
  
  // Body Large (Main Body Text): Inter Regular, 16sp
  static const TextStyle bodyLarge = TextStyle(
    fontFamily: fontFamily,
    fontSize: 16,
    fontWeight: FontWeight.w400,
    color: AppColors.primaryText,
    height: 1.5,
  );
  
  // Body Medium (Secondary Text): Inter Regular, 14sp
  static const TextStyle bodyMedium = TextStyle(
    fontFamily: fontFamily,
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.secondaryText,
    height: 1.4,
  );
  
  // Body Small (Small Body Text): Inter Regular, 12sp
  static const TextStyle bodySmall = TextStyle(
    fontFamily: fontFamily,
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: AppColors.secondaryText,
    height: 1.4,
  );
  
  // Label Small (Captions/Tags): Inter Medium, 12sp
  static const TextStyle labelSmall = TextStyle(
    fontFamily: fontFamily,
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: AppColors.secondaryText,
    height: 1.3,
  );
  
  // Button Text: Inter Medium, 16sp
  static const TextStyle button = TextStyle(
    fontFamily: fontFamily,
    fontSize: 16,
    fontWeight: FontWeight.w500,
    color: Colors.white,
    height: 1.0,
  );
}

class AppSpacing {
  // Baseline 8dp grid system
  static const double xs = 4.0;
  static const double small = 8.0;
  static const double medium = 16.0;
  static const double large = 24.0;
  static const double xl = 32.0;
  static const double xxl = 40.0;
  
  // Screen padding
  static const double screenPadding = 20.0;
  
  // Border radius
  static const double borderRadius = 16.0;
  
  // Elevation
  static const double cardElevation = 4.0;
  static const double pressedElevation = 8.0;
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      
      // Color Scheme
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primaryAccent,
        brightness: Brightness.light,
        primary: AppColors.primaryAccent,
        onPrimary: Colors.white,
        surface: AppColors.cardBackground,
        onSurface: AppColors.primaryText,
        onSurfaceVariant: AppColors.secondaryText,
        background: AppColors.scaffoldBackground,
        onBackground: AppColors.primaryText,
      ),
      
      // Scaffold
      scaffoldBackgroundColor: AppColors.scaffoldBackground,
      
      // App Bar
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.scaffoldBackground,
        foregroundColor: AppColors.primaryText,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: AppTextStyles.headlineMedium,
      ),
      
      // Card Theme
      cardTheme: const CardThemeData(
        color: AppColors.cardBackground,
        elevation: AppSpacing.cardElevation,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(AppSpacing.borderRadius)),
        ),
        shadowColor: AppColors.shadow,
      ),
      
      // Button Themes
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primaryAccent,
          foregroundColor: Colors.white,
          elevation: AppSpacing.cardElevation,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.borderRadius),
          ),
          textStyle: AppTextStyles.button,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.large,
            vertical: AppSpacing.medium,
          ),
        ),
      ),
      
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.secondaryAccent,
          side: const BorderSide(color: AppColors.secondaryAccent),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.borderRadius),
          ),
          textStyle: AppTextStyles.button.copyWith(color: AppColors.secondaryAccent),
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.large,
            vertical: AppSpacing.medium,
          ),
        ),
      ),
      
      // Text Button
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.primaryAccent,
          textStyle: AppTextStyles.button.copyWith(color: AppColors.primaryAccent),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.borderRadius),
          ),
        ),
      ),
      
      // FloatingActionButton
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: AppColors.secondaryAccent,
        foregroundColor: Colors.white,
        elevation: AppSpacing.cardElevation,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(AppSpacing.borderRadius)),
        ),
      ),
      
      // Bottom Navigation Bar
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.cardBackground,
        selectedItemColor: AppColors.primaryAccent,
        unselectedItemColor: AppColors.secondaryAccent,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
        selectedLabelStyle: AppTextStyles.labelSmall,
        unselectedLabelStyle: AppTextStyles.labelSmall,
      ),
      
      // Input Decoration
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.inputFill,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.borderRadius),
          borderSide: const BorderSide(color: AppColors.lightGray),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.borderRadius),
          borderSide: const BorderSide(color: AppColors.lightGray),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.borderRadius),
          borderSide: const BorderSide(color: AppColors.secondaryAccent),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.medium,
          vertical: AppSpacing.medium,
        ),
        hintStyle: AppTextStyles.bodyMedium,
      ),
      
      // Dialog Theme
      dialogTheme: const DialogThemeData(
        backgroundColor: AppColors.cardBackground,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(AppSpacing.borderRadius)),
        ),
        elevation: AppSpacing.pressedElevation,
      ),
      
      // Bottom Sheet Theme
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: AppColors.cardBackground,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            top: Radius.circular(AppSpacing.borderRadius),
          ),
        ),
        elevation: AppSpacing.pressedElevation,
      ),
      
      // Divider
      dividerTheme: const DividerThemeData(
        color: AppColors.divider,
        thickness: 1,
        space: 1,
      ),
      
      // Text Theme
      textTheme: const TextTheme(
        displayLarge: AppTextStyles.displayLarge,
        headlineMedium: AppTextStyles.headlineMedium,
        bodyLarge: AppTextStyles.bodyLarge,
        bodyMedium: AppTextStyles.bodyMedium,
        bodySmall: AppTextStyles.bodySmall,
        labelSmall: AppTextStyles.labelSmall,
      ),
    );
  }
}

// Utility Extensions
extension ColorUtils on Color {
  // Get sentiment color based on sentiment label
  static Color fromSentiment(String? sentiment) {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return AppColors.positive;
      case 'negative':
        return AppColors.negative;
      default:
        return AppColors.neutral;
    }
  }
  
  // Get priority color
  static Color fromPriority(String? priority) {
    switch (priority?.toLowerCase()) {
      case 'high':
        return AppColors.negative;
      case 'medium':
        return AppColors.neutral;
      case 'low':
        return AppColors.positive;
      default:
        return AppColors.neutral;
    }
  }
}