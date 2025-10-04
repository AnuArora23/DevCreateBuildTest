/// API Configuration
/// 
/// Change the API_BASE_URL constant below to switch between different environments
/// without modifying the API service code.

class ApiConfig {
  // ============================================================================
  // 🔧 CHANGE THIS URL TO SWITCH API SERVERS
  // ============================================================================
  
  /// Current API base URL
  /// 
  /// Common configurations:
  /// - Local development (Android): 'http://10.0.2.2:8000'
  /// - Local development (iOS): 'http://localhost:8000'
  /// - Local network: 'http://192.168.1.100:8000' (replace with your computer's IP)
  /// - Production: 'https://your-api-domain.com'
  static const String API_BASE_URL = 'http://10.18.3.35:8000';
  
  // ============================================================================
  
  /// API version path
  static const String API_VERSION = '/api/v1';
  
  /// Full API base URL with version
  static String get fullBaseUrl => '$API_BASE_URL$API_VERSION';
  
  /// Timeout duration for API calls (in seconds)
  static const int REQUEST_TIMEOUT_SECONDS = 10;
  
  /// Enable debug logging for API calls
  static const bool ENABLE_DEBUG_LOGGING = true;
  
  // ============================================================================
  // QUICK SWITCH PRESETS (uncomment the one you want to use)
  // ============================================================================
  
  // Android Emulator
  // static const String API_BASE_URL = 'http://10.0.2.2:8000';
  
  // iOS Simulator
  // static const String API_BASE_URL = 'http://localhost:8000';
  
  // Local Network (replace with your computer's IP)
  // static const String API_BASE_URL = 'http://192.168.1.100:8000';
  
  // Staging Server
  // static const String API_BASE_URL = 'https://staging-api.gosip.com';
  
  // Production Server
  // static const String API_BASE_URL = 'https://api.gosip.com';
  
  // ============================================================================
  
  /// Check if using local development server
  static bool get isLocalDevelopment => 
    API_BASE_URL.contains('localhost') || 
    API_BASE_URL.contains('10.0.2.2') ||
    API_BASE_URL.contains('127.0.0.1');
  
  /// Check if using production server
  static bool get isProduction => 
    API_BASE_URL.startsWith('https://') && 
    !API_BASE_URL.contains('staging');
  
  /// Get display name for current environment
  static String get environmentName {
    if (isProduction) return 'Production';
    if (API_BASE_URL.contains('staging')) return 'Staging';
    if (API_BASE_URL.contains('10.0.2.2')) return 'Local (Android Emulator)';
    if (API_BASE_URL.contains('localhost')) return 'Local (iOS/Desktop)';
    return 'Custom';
  }
  
  /// Print current configuration (useful for debugging)
  static void printConfig() {
    print('════════════════════════════════════════════════════════');
    print('📡 API Configuration');
    print('════════════════════════════════════════════════════════');
    print('Environment: ${environmentName}');
    print('Base URL: $API_BASE_URL');
    print('Full URL: $fullBaseUrl');
    print('Timeout: ${REQUEST_TIMEOUT_SECONDS}s');
    print('Debug Logging: ${ENABLE_DEBUG_LOGGING ? "Enabled" : "Disabled"}');
    print('════════════════════════════════════════════════════════');
  }
}
