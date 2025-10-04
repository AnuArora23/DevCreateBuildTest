import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gosip/models/case_file.dart';
import 'package:gosip/services/database_service.dart';
import 'package:image_picker/image_picker.dart';
import 'package:location/location.dart';
import 'package:gosip/models/evidence.dart';
import 'package:uuid/uuid.dart';
import 'package:gosip/providers/app_providers.dart';

class UploadScreen extends ConsumerStatefulWidget {
  const UploadScreen({super.key});

  @override
  _UploadScreenState createState() => _UploadScreenState();
}

class _UploadScreenState extends ConsumerState<UploadScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _summaryController = TextEditingController();
  final _tagsController = TextEditingController();
  XFile? _image;

  LocationData? _currentLocation;

  @override
  void initState() {
    super.initState();
    _getLocation();
  }

  Future<void> _getLocation() async {
    final location = Location();
    try {
      final currentLocation = await location.getLocation();
      setState(() {
        _currentLocation = currentLocation;
      });
    } catch (e) {
      // Handle location errors
      print('Error getting location: $e');
    }
  }

  Future<void> _pickImage() async {
    final image = await ImagePicker().pickImage(source: ImageSource.gallery);
    setState(() {
      _image = image;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Upload Incident'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(labelText: 'Title'),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a title';
                  }
                  return null;
                },
              ),
              TextFormField(
                controller: _summaryController,
                decoration: const InputDecoration(labelText: 'Summary'),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a summary';
                  }
                  return null;
                },
              ),
              TextFormField(
                controller: _tagsController,
                decoration: const InputDecoration(labelText: 'Tags (comma-separated)'),
              ),
              const SizedBox(height: 20),
              _image == null
                  ? TextButton.icon(
                      onPressed: _pickImage,
                      icon: const Icon(Icons.image),
                      label: const Text('Add Evidence (Optional)'),
                    )
                  : Image.file(File(_image!.path)),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _submit,
                child: const Text('Submit'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (_formKey.currentState!.validate()) {
      if (_currentLocation == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not get current location. Please try again.')),
        );
        return;
      }

      final tags = _tagsController.text.split(',').map((e) => e.trim()).toList();
      final caseFileId = const Uuid().v4();
      final newCase = CaseFile(
        id: 0,
        caseFileId: caseFileId,
        title: _titleController.text,
        summary: _summaryController.text,
        reportCount: 1,
        primarySource: 'User Upload',
        firstReported: DateTime.now().toIso8601String(),
        lastUpdated: DateTime.now().toIso8601String(),
        latitude: _currentLocation!.latitude!,
        longitude: _currentLocation!.longitude!,
        sentimentLabel: 'Neutral',
        sentimentScore: 0.0,
        tags: tags,
        status: 'Active',
        priority: 'Medium',
      );

      await DatabaseService.insertCaseFile(newCase);

      if (_image != null) {
        final newEvidence = Evidence(
          id: 0,
          evidenceId: const Uuid().v4(),
          caseFileId: caseFileId,
          evidenceType: 'Image',
          sourceUrl: _image!.path,
          description: 'User uploaded evidence',
          collectedDate: DateTime.now().toIso8601String(),
          metadata: {},
        );
        await DatabaseService.insertEvidence(newEvidence);
      }

      ref.invalidate(caseFilesNotifierProvider);
      ref.invalidate(caseFilesWithMessageCountsProvider);

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Incident uploaded successfully')),
      );

      Navigator.of(context).pop();
    }
  }
}