# GOSIP - Interactive Intelligence Dashboard for Personal Safety

## Project Overview

GOSIP is a Flutter-based mobile application designed to enhance personal safety through an interactive intelligence dashboard. It provides users with real-time alerts, a community forum for sharing information, and the ability to monitor specific geographical zones. The app is built with Flutter and Dart, uses Riverpod for state management, and stores data locally using a SQLite database.

### Key Technologies

*   **Frontend:** Flutter
*   **Programming Language:** Dart
*   **State Management:** Riverpod
*   **Database:** SQLite (using the `sqflite` package)
*   **Mapping:** OpenStreetMap (using `flutter_map`)
*   **UI Components:** Feather Icons, Material Design

### Architecture

The application is structured into several key components:

*   **`main.dart`:** The entry point of the application.
*   **`screens`:** Contains the different screens of the app, such as the main screen, map screen, gossip screen, and profile screen.
*   **`models`:** Defines the data models for the application, including `CaseFile`, `Evidence`, `GossipMessage`, `MonitoredZone`, and `OsintReport`.
*   **`services`:** Includes the `DatabaseService`, which handles all interactions with the local SQLite database.
*   **`providers`:** Manages the application's state using Riverpod.
*   **`utils`:** Contains utility files, such as the application's theme.
*   **`widgets`:** Contains reusable UI components.

## Building and Running

### Prerequisites

*   Flutter SDK
*   Dart SDK

### Build and Run

1.  **Install dependencies:**
    ```bash
    flutter pub get
    ```
2.  **Run the app:**
    ```bash
    flutter run
    ```

### Build for Release

*   **Android:**
    ```bash
    flutter build apk --release
    ```
*   **iOS:**
    ```bash
    flutter build ios --release
    ```

## Development Conventions

*   **State Management:** The project uses Riverpod for state management. Providers are defined in the `lib/providers` directory.
*   **Database:** The application uses a local SQLite database for data persistence. The database schema and interactions are managed by the `DatabaseService` in `lib/services/database_service.dart`.
*   **Code Generation:** The project uses `build_runner` for code generation, particularly for Riverpod providers and JSON serialization.
*   **Linting:** The project uses `flutter_lints` for code linting.
*   **UI:** The UI is built with Material Design components and styled using a custom theme defined in `lib/utils/theme.dart`.
