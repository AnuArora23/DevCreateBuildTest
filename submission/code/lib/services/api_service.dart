import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../models/incident.dart';
import '../config/api_config.dart';

class ApiService {
  /// Get the base URL for API calls from configuration
  String get _baseUrl => ApiConfig.fullBaseUrl;
  
  /// Get timeout duration from configuration
  Duration get _timeout => Duration(seconds: ApiConfig.REQUEST_TIMEOUT_SECONDS);
  
  /// Log API calls if debug logging is enabled
  void _log(String message) {
    if (ApiConfig.ENABLE_DEBUG_LOGGING) {
      print('🌐 [API] $message');
    }
  }

  /// Get list of incidents with pagination
  /// [skip] - Number of records to skip (default: 0)
  /// [limit] - Number of records to return (default: 20, max: 100)
  Future<List<Incident>> getIncidents({int skip = 0, int limit = 20}) async {
    try {
      final uri = Uri.parse('$_baseUrl/incidents/').replace(
        queryParameters: {
          'skip': skip.toString(),
          'limit': limit.toString(),
        },
      );
      
      _log('GET $uri');
      
      final response = await http.get(uri).timeout(_timeout);

      _log('Response: ${response.statusCode}');
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        // Check if 'incidents' key exists and is a list
        if (data is Map<String, dynamic> && data.containsKey('incidents')) {
          final List<dynamic> incidentJson = data['incidents'] as List<dynamic>;
          _log('Successfully loaded ${incidentJson.length} incidents');
          return incidentJson.map((json) => Incident.fromJson(json as Map<String, dynamic>)).toList();
        } else {
          throw Exception('Invalid response format from API');
        }
      } else {
        throw Exception('Failed to load incidents: ${response.statusCode}');
      }
    } on SocketException {
      throw Exception('Cannot connect to API server at ${ApiConfig.API_BASE_URL}. Make sure the server is running.');
    } on http.ClientException {
      throw Exception('Network error. Please check your connection.');
    } catch (e) {
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Unexpected error: $e');
    }
  }

  /// Get single incident by ID
  Future<Incident> getIncidentDetails(String id) async {
    try {
      final uri = Uri.parse('$_baseUrl/incidents/$id');
      _log('GET $uri');
      
      final response = await http.get(uri).timeout(_timeout);

      _log('Response: ${response.statusCode}');
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _log('Successfully loaded incident details');
        return Incident.fromJson(data as Map<String, dynamic>);
      } else if (response.statusCode == 404) {
        throw Exception('Incident not found');
      } else {
        throw Exception('Failed to load incident details: ${response.statusCode}');
      }
    } on SocketException {
      throw Exception('Cannot connect to API server at ${ApiConfig.API_BASE_URL}. Make sure the server is running.');
    } on http.ClientException {
      throw Exception('Network error. Please check your connection.');
    } catch (e) {
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Unexpected error: $e');
    }
  }

  /// Get nearby incidents within a radius
  /// [latitude] - Center point latitude
  /// [longitude] - Center point longitude
  /// [radiusKm] - Search radius in kilometers
  Future<List<Incident>> getNearbyIncidents({
    required double latitude,
    required double longitude,
    required double radiusKm,
  }) async {
    try {
      final uri = Uri.parse('$_baseUrl/incidents/nearby/').replace(
        queryParameters: {
          'lat': latitude.toString(),
          'lon': longitude.toString(),
          'radius_km': radiusKm.toString(),
        },
      );

      _log('GET $uri');
      
      final response = await http.get(uri).timeout(_timeout);

      _log('Response: ${response.statusCode}');
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        // The nearby endpoint returns a list directly, not wrapped in an object
        if (data is List) {
          _log('Successfully loaded ${data.length} nearby incidents');
          return data.map((json) => Incident.fromJson(json as Map<String, dynamic>)).toList();
        } else {
          throw Exception('Invalid response format from nearby API');
        }
      } else {
        throw Exception('Failed to load nearby incidents: ${response.statusCode}');
      }
    } on SocketException {
      throw Exception('Cannot connect to API server at ${ApiConfig.API_BASE_URL}. Make sure the server is running.');
    } on http.ClientException {
      throw Exception('Network error. Please check your connection.');
    } catch (e) {
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Unexpected error: $e');
    }
  }

  /// Check API health
  Future<bool> checkHealth() async {
    try {
      final uri = Uri.parse('${ApiConfig.API_BASE_URL}/health');
      _log('GET $uri (health check)');
      
      final response = await http.get(uri).timeout(
        Duration(seconds: 5),
      );
      
      final isHealthy = response.statusCode == 200;
      _log('Health check: ${isHealthy ? "✓ Healthy" : "✗ Unhealthy"}');
      
      return isHealthy;
    } catch (e) {
      _log('Health check failed: $e');
      return false;
    }
  }
}
