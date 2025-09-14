# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

StepUp is a React Native health tracking app built with Expo that monitors wake-up habits using step count data from Apple Health (iOS). The app displays a contribution graph showing three states: perfect (≥15 steps before target wake time), good (≥15 steps total for the day), and missed (<15 steps).

The project follows a clean architecture with organized source code under `src/` directory and comprehensive documentation in `docs/`.

## Development Commands

```bash
# Start development server with tunnel (default)
pnpm dev

# Platform-specific development
pnpm ios           # Start iOS simulator
pnpm android       # Start Android emulator
pnpm web           # Start web version

# Code quality
pnpm typecheck     # Run TypeScript type checking
pnpm lint          # Run Biome linting
pnpm lint:fix      # Run Biome linting with auto-fix
pnpm format        # Format code with Biome
```

## Architecture

### Tech Stack
- **Framework**: React Native with Expo (SDK 54)
- **Routing**: Expo Router with typed routes
- **UI Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: React hooks with AsyncStorage for persistence
- **Language**: TypeScript
- **Code Quality**: Biome for linting and formatting
- **Package Manager**: pnpm

### Project Structure
```
├── docs/                    # Documentation
├── src/                     # Source code
│   ├── components/          # Reusable UI components
│   ├── constants/           # Theme and configuration constants
│   ├── styles/              # Global styles (Tailwind)
│   └── types/               # TypeScript type definitions
├── app/(tabs)/              # Expo Router screens
├── assets/                  # Static assets (icons, images)
└── [config files]           # Root-level configuration
```

### Key Components

1. **Tab Navigation** (`app/(tabs)/_layout.tsx`): Two-tab structure
   - Alarm tab: Main screen with time picker and settings
   - Stats tab: Contribution graph and statistics

2. **Home Screen** (`app/(tabs)/index.tsx`): Main functionality
   - Time picker interface for setting wake-up target
   - Settings toggles for sound, vibration, snooze
   - Clean, minimal UI with glass morphism effects

3. **Stats Screen** (`app/(tabs)/stats.tsx`): Data visualization
   - Contribution graph showing wake-up consistency
   - Mock data generation for development
   - Responsive grid layout

4. **ContributionGraph** (`src/components/ContributionGraph.tsx`): Visual display
   - Renders configurable day grid
   - Auto-adapts to screen width
   - Color coding: green (perfect), light green (good), gray (missed)

### Data Processing Logic

Currently implemented with mock data for development:
1. Generates random status for each day: "perfect", "good", "missed", or "future"
2. Future implementation will integrate with Apple HealthKit:
   - Check step count from midnight to target wake time
   - If ≥15 steps before target time: "perfect"
   - Otherwise, check total daily steps
   - If ≥15 steps total: "good", else: "missed"

### Storage Keys
- `TARGET_WAKE_TIME`: User's target wake time (HH:MM format)
- `LAST_PROCESSED_DATE`: Last date processed to avoid recomputation

### Development Notes
- Stats screen currently uses mock data generation for demonstration
- Health integration is prepared but commented out for development
- Error handling simplified for cleaner development experience
- Biome configuration enforces consistent code style and quality