# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

StepUp is a React Native health tracking app built with Expo that monitors wake-up habits using step count data from Apple Health (iOS). The app displays a contribution graph showing three states: perfect (≥15 steps before target wake time), good (≥15 steps total for the day), and missed (<15 steps).

## Development Commands

```bash
# Start development server with tunnel (default)
pnpm dev

# Start with specific network options
pnpm dev:tunnel    # Tunnel mode with cache clear
pnpm dev:lan       # LAN mode with cache clear  
pnpm dev:local     # Localhost mode with cache clear

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
- **Framework**: React Native with Expo (SDK 53)
- **Routing**: Expo Router with typed routes
- **UI Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: React hooks with AsyncStorage for persistence
- **Language**: TypeScript

### Key Components

1. **Tab Navigation** (`app/(tabs)/_layout.tsx`): Two-tab structure
   - Home tab: Shows contribution graph and health data permissions
   - Settings tab: Configure target wake time

2. **Home Screen** (`app/(tabs)/index.tsx`): Main functionality
   - Requests HealthKit permissions for step count data
   - Processes daily step counts to determine wake status
   - Uses AppState listener to refresh data when app becomes active
   - Stores last processed date to avoid reprocessing

3. **ContributionGraph** (`components/ContributionGraph.tsx`): Visual display
   - Renders 90-day grid (configurable)
   - Auto-adapts to screen width
   - Color coding: green (perfect), light green (good), gray (missed)

### Data Processing Logic

The app determines wake-up success by:
1. Checking step count from midnight to target wake time
2. If ≥15 steps before target time: "perfect"
3. Otherwise, check total daily steps
4. If ≥15 steps total: "good", else: "missed"

### Storage Keys
- `TARGET_WAKE_TIME`: User's target wake time (HH:MM format)
- `LAST_PROCESSED_DATE`: Last date processed to avoid recomputation

### Health Integration
The app uses a defensive import strategy for expo-health-kit to handle SDK changes gracefully. It supports both legacy and modern API methods for step count queries.