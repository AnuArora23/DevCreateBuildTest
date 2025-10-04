import 'dart:io';
import 'package:flutter/services.dart';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';
import 'package:sqflite/sqflite.dart';

import '../models/osint_report.dart';
import '../models/case_file.dart';
import '../models/evidence.dart';
import '../models/gossip_message.dart';
import '../models/monitored_zone.dart';

class DatabaseService {
  static Database? _database;
  static const String _databaseName = 'gosip.db';

  static Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  static Future<Database> _initDatabase() async {
    final documentsDirectory = await getApplicationDocumentsDirectory();
    final path = join(documentsDirectory.path, _databaseName);

    // Check if database exists in app directory
    final exists = await databaseExists(path);
    
    if (!exists) {
      // Copy from assets
      try {
        await Directory(dirname(path)).create(recursive: true);
      } catch (_) {}

      try {
        // Try to copy from assets first
        ByteData data = await rootBundle.load('assets/$_databaseName');
        List<int> bytes = data.buffer.asUint8List(data.offsetInBytes, data.lengthInBytes);
        await File(path).writeAsBytes(bytes);
      } catch (e) {
        // If asset doesn't exist, create database with schema
        print("Asset database not found, creating new database: $e");
        return await _createDatabase(path);
      }
    }

    return await openDatabase(path, readOnly: false);
  }

  static Future<Database> _createDatabase(String path) async {
    return await openDatabase(
      path,
      version: 1,
      onCreate: (Database db, int version) async {
        // Create tables with exact schema from backend
        await db.execute('''
          CREATE TABLE osint_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            case_file_id TEXT UNIQUE NOT NULL,
            report_date TEXT NOT NULL,
            content TEXT NOT NULL,
            author_username TEXT,
            url TEXT,
            source_platform TEXT,
            sentiment_label TEXT,
            sentiment_score REAL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            tags TEXT
          )
        ''');

        await db.execute('''
          CREATE TABLE case_files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            case_file_id TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            summary TEXT NOT NULL,
            report_count INTEGER DEFAULT 1,
            primary_source TEXT,
            first_reported TEXT NOT NULL,
            last_updated TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            sentiment_label TEXT,
            sentiment_score REAL,
            tags TEXT,
            status TEXT DEFAULT 'Active',
            priority TEXT DEFAULT 'Medium'
          )
        ''');

        await db.execute('''
          CREATE TABLE evidence_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            evidence_id TEXT UNIQUE NOT NULL,
            case_file_id TEXT NOT NULL,
            evidence_type TEXT NOT NULL,
            source_url TEXT,
            description TEXT,
            collected_date TEXT NOT NULL,
            metadata TEXT
          )
        ''');

        await db.execute('''
          CREATE TABLE gossip_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id TEXT UNIQUE NOT NULL,
            case_file_id TEXT NOT NULL,
            username TEXT NOT NULL,
            message_text TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            is_verified INTEGER DEFAULT 0,
            upvotes INTEGER DEFAULT 0
          )
        ''');

        await db.execute('''
          CREATE TABLE monitored_zones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            zone_id TEXT UNIQUE NOT NULL,
            zone_name TEXT NOT NULL,
            center_latitude REAL NOT NULL,
            center_longitude REAL NOT NULL,
            radius_meters INTEGER NOT NULL,
            created_date TEXT NOT NULL,
            is_active INTEGER DEFAULT 1,
            notification_enabled INTEGER DEFAULT 1
          )
        ''');

        // Insert sample data for demo
        await _insertSampleData(db);
      },
    );
  }

  static Future<void> _insertSampleData(Database db) async {
    await _insertWomenSafetySampleData(db);
  }

  static Future<void> _insertWomenSafetySampleData(Database db) async {
    final double baseLatitude = 30.819908;
    final double baseLongitude = 75.556128;

    for (int i = 1; i <= 15; i++) {
      final caseFileId = 'case-ws-$i';
      final latitude = baseLatitude + (i * 0.001) - 0.0075;
      final longitude = baseLongitude + (i * 0.001) - 0.0075;

      // Insert OSINT Report
      await db.insert('osint_reports', {
        'case_file_id': caseFileId,
        'report_date': DateTime.now().subtract(Duration(hours: i)).toIso8601String(),
        'content': 'Report of suspicious activity near the old factory. A group of men were seen harassing women.',
        'author_username': 'LocalResident',
        'url': 'https://gosip.local/report/ws-$i',
        'source_platform': 'Social Media',
        'sentiment_label': 'Negative',
        'sentiment_score': -0.8,
        'latitude': latitude,
        'longitude': longitude,
        'tags': '["women-safety", "harassment"]'
      });

      // Insert Case File
      await db.insert('case_files', {
        'case_file_id': caseFileId,
        'title': 'Suspicious Activity Case #$i',
        'summary': 'Investigation into reports of harassment and suspicious individuals in the area.',
        'report_count': 1,
        'primary_source': 'Social Media',
        'first_reported': DateTime.now().subtract(Duration(hours: i)).toIso8601String(),
        'last_updated': DateTime.now().subtract(Duration(minutes: i * 5)).toIso8601String(),
        'latitude': latitude,
        'longitude': longitude,
        'sentiment_label': 'Negative',
        'sentiment_score': -0.8,
        'tags': '["women-safety", "suspicious-activity"]',
        'status': 'Active',
        'priority': 'High'
      });

      // Insert Evidence
      if (i == 1) {
        await db.insert('evidence_items', {
          'evidence_id': 'ev-ws-$i-1',
          'case_file_id': caseFileId,
          'evidence_type': 'Image',
          'source_url': 'https://example.com/image1.jpg',
          'description': 'Photo of the suspects near the old factory.',
          'collected_date': DateTime.now().subtract(Duration(hours: i)).toIso8601String(),
          'metadata': '{}'
        });
        await db.insert('evidence_items', {
          'evidence_id': 'ev-ws-$i-2',
          'case_file_id': caseFileId,
          'evidence_type': 'Video',
          'source_url': 'https://example.com/video1.mp4',
          'description': 'Video footage of the incident.',
          'collected_date': DateTime.now().subtract(Duration(hours: i)).toIso8601String(),
          'metadata': '{}'
        });
      } else if (i == 2 || i == 3) {
        await db.insert('evidence_items', {
          'evidence_id': 'ev-ws-$i-1',
          'case_file_id': caseFileId,
          'evidence_type': 'Audio',
          'source_url': 'https://example.com/audio$i.mp3',
          'description': 'Audio recording of witness testimony.',
          'collected_date': DateTime.now().subtract(Duration(hours: i)).toIso8601String(),
          'metadata': '{}'
        });
      }

      // Insert Gossip Messages in Hindi
      await db.insert('gossip_messages', {
        'message_id': 'msg-ws-$i-1',
        'case_file_id': caseFileId,
        'username': 'ConcernedCitizen',
        'message_text': 'यह बहुत ही चिंताजनक है। हमें अपनी बहनों की सुरक्षा के लिए कुछ करना होगा।', // This is very worrying. We have to do something for the safety of our sisters.
        'timestamp': DateTime.now().subtract(Duration(minutes: i * 4)).toIso8601String(),
        'is_verified': 1,
        'upvotes': 10 + i
      });

      await db.insert('gossip_messages', {
        'message_id': 'msg-ws-$i-2',
        'case_file_id': caseFileId,
        'username': 'LocalGuide',
        'message_text': 'पुलिस को इस इलाके में गश्त बढ़ानी चाहिए।', // The police should increase patrolling in this area.
        'timestamp': DateTime.now().subtract(Duration(minutes: i * 3)).toIso8601String(),
        'is_verified': 0,
        'upvotes': 5 + i
      });
    }
  }

  // OSINT Reports
  static Future<List<OsintReport>> getAllReports() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query('osint_reports');
    return List.generate(maps.length, (i) => OsintReport.fromMap(maps[i]));
  }

  static Future<OsintReport?> getReportById(String caseFileId) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'osint_reports',
      where: 'case_file_id = ?',
      whereArgs: [caseFileId],
    );
    
    if (maps.isNotEmpty) {
      return OsintReport.fromMap(maps.first);
    }
    return null;
  }

  // Case Files
  static Future<List<CaseFile>> getAllCaseFiles() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query('case_files');
    
    final List<CaseFile> caseFiles = [];
    for (final map in maps) {
      final caseFileId = map['case_file_id'] as String;
      final evidence = await getEvidenceForCaseFile(caseFileId);
      final caseFile = CaseFile.fromMap(map).copyWith(evidence: evidence);
      caseFiles.add(caseFile);
    }
    
    return caseFiles;
  }

  static Future<CaseFile?> getCaseFileById(String caseFileId) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'case_files',
      where: 'case_file_id = ?',
      whereArgs: [caseFileId],
    );
    
    if (maps.isNotEmpty) {
      final caseFileMap = maps.first;
      final evidence = await getEvidenceForCaseFile(caseFileId);
      final caseFile = CaseFile.fromMap(caseFileMap).copyWith(evidence: evidence);
      return caseFile;
    }
    return null;
  }

  static Future<int> insertCaseFile(CaseFile caseFile) async {
    final db = await database;
    return await db.insert('case_files', caseFile.toMap());
  }

  // Evidence
  static Future<List<Evidence>> getEvidenceForCaseFile(String caseFileId) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'evidence_items',
      where: 'case_file_id = ?',
      whereArgs: [caseFileId],
    );
    return List.generate(maps.length, (i) => Evidence.fromMap(maps[i]));
  }

  static Future<int> insertEvidence(Evidence evidence) async {
    final db = await database;
    return await db.insert('evidence_items', evidence.toMap());
  }

  // Gossip Messages
  static Future<List<GossipMessage>> getMessagesForCaseFile(String caseFileId) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'gossip_messages',
      where: 'case_file_id = ?',
      whereArgs: [caseFileId],
      orderBy: 'timestamp ASC',
    );
    return List.generate(maps.length, (i) => GossipMessage.fromMap(maps[i]));
  }

  static Future<List<GossipMessage>> getMessagesByCaseFileId(String caseFileId) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'gossip_messages',
      where: 'case_file_id = ?',
      whereArgs: [caseFileId],
      orderBy: 'timestamp DESC',
    );
    return List.generate(maps.length, (i) => GossipMessage.fromMap(maps[i]));
  }

  static Future<int> insertMessage(GossipMessage message) async {
    final db = await database;
    return await db.insert('gossip_messages', message.toMap());
  }

  static Future<int> deleteMessage(String messageId) async {
    final db = await database;
    return await db.delete(
      'gossip_messages',
      where: 'message_id = ?',
      whereArgs: [messageId],
    );
  }

  static Future<List<GossipMessage>> getAllGossipMessages() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'gossip_messages',
      orderBy: 'timestamp DESC',
    );
    return List.generate(maps.length, (i) => GossipMessage.fromMap(maps[i]));
  }

  // Get all case files with message counts for Gossip screen
  static Future<List<Map<String, dynamic>>> getCaseFilesWithMessageCounts() async {
    final db = await database;
    final result = await db.rawQuery('''
      SELECT cf.*, COUNT(gm.id) as message_count
      FROM case_files cf
      LEFT JOIN gossip_messages gm ON cf.case_file_id = gm.case_file_id
      GROUP BY cf.case_file_id
      ORDER BY cf.last_updated DESC
    ''');
    return result;
  }

  // Monitored Zones
  static Future<List<MonitoredZone>> getAllMonitoredZones() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query('monitored_zones');
    return List.generate(maps.length, (i) => MonitoredZone.fromMap(maps[i]));
  }

  static Future<int> insertMonitoredZone(MonitoredZone zone) async {
    final db = await database;
    return await db.insert('monitored_zones', zone.toMap());
  }

  static Future<int> updateMonitoredZone(MonitoredZone zone) async {
    final db = await database;
    return await db.update(
      'monitored_zones',
      zone.toMap(),
      where: 'zone_id = ?',
      whereArgs: [zone.zoneId],
    );
  }

  static Future<int> deleteMonitoredZone(String zoneId) async {
    final db = await database;
    return await db.delete(
      'monitored_zones',
      where: 'zone_id = ?',
      whereArgs: [zoneId],
    );
  }

  // Search functionality
  static Future<List<OsintReport>> searchReports(String query) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'osint_reports',
      where: 'content LIKE ? OR tags LIKE ?',
      whereArgs: ['%$query%', '%$query%'],
    );
    return List.generate(maps.length, (i) => OsintReport.fromMap(maps[i]));
  }

  static Future<List<CaseFile>> searchCaseFiles(String query) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'case_files',
      where: 'title LIKE ? OR summary LIKE ? OR tags LIKE ?',
      whereArgs: ['%$query%', '%$query%', '%$query%'],
    );
    
    final List<CaseFile> caseFiles = [];
    for (final map in maps) {
      final caseFileId = map['case_file_id'] as String;
      final evidence = await getEvidenceForCaseFile(caseFileId);
      final caseFile = CaseFile.fromMap(map).copyWith(evidence: evidence);
      caseFiles.add(caseFile);
    }
    
    return caseFiles;
  }
}