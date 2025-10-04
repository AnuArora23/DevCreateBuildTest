// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_providers.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$apiServiceHash() => r'ce72c4f572ea14a273b01086cdc8905a2e469468';

/// See also [apiService].
@ProviderFor(apiService)
final apiServiceProvider = AutoDisposeProvider<ApiService>.internal(
  apiService,
  name: r'apiServiceProvider',
  debugGetCreateSourceHash:
      const bool.fromEnvironment('dart.vm.product') ? null : _$apiServiceHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef ApiServiceRef = AutoDisposeProviderRef<ApiService>;
String _$incidentsHash() => r'83f4f35c2639578ef5de97be8ff2ca4fcdf1c83f';

/// See also [incidents].
@ProviderFor(incidents)
final incidentsProvider = AutoDisposeFutureProvider<List<Incident>>.internal(
  incidents,
  name: r'incidentsProvider',
  debugGetCreateSourceHash:
      const bool.fromEnvironment('dart.vm.product') ? null : _$incidentsHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef IncidentsRef = AutoDisposeFutureProviderRef<List<Incident>>;
String _$caseFilesHash() => r'4605b7fc34bf5cbabb9aeb84bfa95765dde07097';

/// See also [caseFiles].
@ProviderFor(caseFiles)
final caseFilesProvider = AutoDisposeFutureProvider<List<CaseFile>>.internal(
  caseFiles,
  name: r'caseFilesProvider',
  debugGetCreateSourceHash:
      const bool.fromEnvironment('dart.vm.product') ? null : _$caseFilesHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef CaseFilesRef = AutoDisposeFutureProviderRef<List<CaseFile>>;
String _$gossipMessagesHash() => r'0e7be08d32c856acd32f25e475f163694ab833c8';

/// See also [gossipMessages].
@ProviderFor(gossipMessages)
final gossipMessagesProvider =
    AutoDisposeFutureProvider<List<GossipMessage>>.internal(
  gossipMessages,
  name: r'gossipMessagesProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$gossipMessagesHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef GossipMessagesRef = AutoDisposeFutureProviderRef<List<GossipMessage>>;
String _$monitoredZonesHash() => r'adafd7c0afbbd0f687a710b6422a09417bb25a4d';

/// See also [monitoredZones].
@ProviderFor(monitoredZones)
final monitoredZonesProvider =
    AutoDisposeFutureProvider<List<MonitoredZone>>.internal(
  monitoredZones,
  name: r'monitoredZonesProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$monitoredZonesHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef MonitoredZonesRef = AutoDisposeFutureProviderRef<List<MonitoredZone>>;
String _$databaseServiceHash() => r'766f41a8fb8947216fae68bbc31fa62d037f6899';

/// See also [databaseService].
@ProviderFor(databaseService)
final databaseServiceProvider = AutoDisposeProvider<DatabaseService>.internal(
  databaseService,
  name: r'databaseServiceProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$databaseServiceHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef DatabaseServiceRef = AutoDisposeProviderRef<DatabaseService>;
String _$caseFilesWithMessageCountsHash() =>
    r'd53bf13ef67b7c8550f85944fe4dddd5e3aced41';

/// See also [caseFilesWithMessageCounts].
@ProviderFor(caseFilesWithMessageCounts)
final caseFilesWithMessageCountsProvider =
    AutoDisposeFutureProvider<List<Map<String, dynamic>>>.internal(
  caseFilesWithMessageCounts,
  name: r'caseFilesWithMessageCountsProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$caseFilesWithMessageCountsHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef CaseFilesWithMessageCountsRef
    = AutoDisposeFutureProviderRef<List<Map<String, dynamic>>>;
String _$messageNotifierHash() => r'a7e73618ad052b72f5fc31991985438f86f892ba';

/// Copied from Dart SDK
class _SystemHash {
  _SystemHash._();

  static int combine(int hash, int value) {
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + value);
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + ((0x0007ffff & hash) << 10));
    return hash ^ (hash >> 6);
  }

  static int finish(int hash) {
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + ((0x03ffffff & hash) << 3));
    // ignore: parameter_assignments
    hash = hash ^ (hash >> 11);
    return 0x1fffffff & (hash + ((0x00003fff & hash) << 15));
  }
}

abstract class _$MessageNotifier
    extends BuildlessAutoDisposeAsyncNotifier<List<GossipMessage>> {
  late final String caseFileId;

  FutureOr<List<GossipMessage>> build(
    String caseFileId,
  );
}

/// See also [MessageNotifier].
@ProviderFor(MessageNotifier)
const messageNotifierProvider = MessageNotifierFamily();

/// See also [MessageNotifier].
class MessageNotifierFamily extends Family<AsyncValue<List<GossipMessage>>> {
  /// See also [MessageNotifier].
  const MessageNotifierFamily();

  /// See also [MessageNotifier].
  MessageNotifierProvider call(
    String caseFileId,
  ) {
    return MessageNotifierProvider(
      caseFileId,
    );
  }

  @override
  MessageNotifierProvider getProviderOverride(
    covariant MessageNotifierProvider provider,
  ) {
    return call(
      provider.caseFileId,
    );
  }

  static const Iterable<ProviderOrFamily>? _dependencies = null;

  @override
  Iterable<ProviderOrFamily>? get dependencies => _dependencies;

  static const Iterable<ProviderOrFamily>? _allTransitiveDependencies = null;

  @override
  Iterable<ProviderOrFamily>? get allTransitiveDependencies =>
      _allTransitiveDependencies;

  @override
  String? get name => r'messageNotifierProvider';
}

/// See also [MessageNotifier].
class MessageNotifierProvider extends AutoDisposeAsyncNotifierProviderImpl<
    MessageNotifier, List<GossipMessage>> {
  /// See also [MessageNotifier].
  MessageNotifierProvider(
    String caseFileId,
  ) : this._internal(
          () => MessageNotifier()..caseFileId = caseFileId,
          from: messageNotifierProvider,
          name: r'messageNotifierProvider',
          debugGetCreateSourceHash:
              const bool.fromEnvironment('dart.vm.product')
                  ? null
                  : _$messageNotifierHash,
          dependencies: MessageNotifierFamily._dependencies,
          allTransitiveDependencies:
              MessageNotifierFamily._allTransitiveDependencies,
          caseFileId: caseFileId,
        );

  MessageNotifierProvider._internal(
    super._createNotifier, {
    required super.name,
    required super.dependencies,
    required super.allTransitiveDependencies,
    required super.debugGetCreateSourceHash,
    required super.from,
    required this.caseFileId,
  }) : super.internal();

  final String caseFileId;

  @override
  FutureOr<List<GossipMessage>> runNotifierBuild(
    covariant MessageNotifier notifier,
  ) {
    return notifier.build(
      caseFileId,
    );
  }

  @override
  Override overrideWith(MessageNotifier Function() create) {
    return ProviderOverride(
      origin: this,
      override: MessageNotifierProvider._internal(
        () => create()..caseFileId = caseFileId,
        from: from,
        name: null,
        dependencies: null,
        allTransitiveDependencies: null,
        debugGetCreateSourceHash: null,
        caseFileId: caseFileId,
      ),
    );
  }

  @override
  AutoDisposeAsyncNotifierProviderElement<MessageNotifier, List<GossipMessage>>
      createElement() {
    return _MessageNotifierProviderElement(this);
  }

  @override
  bool operator ==(Object other) {
    return other is MessageNotifierProvider && other.caseFileId == caseFileId;
  }

  @override
  int get hashCode {
    var hash = _SystemHash.combine(0, runtimeType.hashCode);
    hash = _SystemHash.combine(hash, caseFileId.hashCode);

    return _SystemHash.finish(hash);
  }
}

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
mixin MessageNotifierRef
    on AutoDisposeAsyncNotifierProviderRef<List<GossipMessage>> {
  /// The parameter `caseFileId` of this provider.
  String get caseFileId;
}

class _MessageNotifierProviderElement
    extends AutoDisposeAsyncNotifierProviderElement<MessageNotifier,
        List<GossipMessage>> with MessageNotifierRef {
  _MessageNotifierProviderElement(super.provider);

  @override
  String get caseFileId => (origin as MessageNotifierProvider).caseFileId;
}

String _$zoneNotifierHash() => r'70dac6676c0d84ad501284195e3ceb86a11d11fa';

/// See also [ZoneNotifier].
@ProviderFor(ZoneNotifier)
final zoneNotifierProvider = AutoDisposeAsyncNotifierProvider<ZoneNotifier,
    List<MonitoredZone>>.internal(
  ZoneNotifier.new,
  name: r'zoneNotifierProvider',
  debugGetCreateSourceHash:
      const bool.fromEnvironment('dart.vm.product') ? null : _$zoneNotifierHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

typedef _$ZoneNotifier = AutoDisposeAsyncNotifier<List<MonitoredZone>>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package
