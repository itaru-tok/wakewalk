# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WakeWalk is a React Native health tracking app built with Expo that monitors wake-up habits using step count data from Apple Health (iOS). The app displays a contribution graph showing three states: perfect (≥15 steps before target wake time), good (≥15 steps total for the day), and missed (<15 steps).

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
- **Monetization**: 
  - AdMob for banner ads (free users only)
  - RevenueCat for subscription management
- **Native Modules**: Custom Swift module for alarm functionality
- **Language**: TypeScript
- **Code Quality**: Biome for linting and formatting
- **Package Manager**: pnpm

### Project Structure
```
├── docs/                    # Documentation
├── src/                     # Source code
│   ├── components/          # Reusable UI components (PaywallModal, MyAdmob, etc.)
│   ├── constants/           # Theme and configuration constants
│   ├── context/             # React Context providers (PremiumContext, AlarmSettingsContext)
│   ├── hooks/               # Custom React hooks (useAlarmHandler, useStreaks, etc.)
│   ├── native/              # Native module interfaces
│   ├── storage/             # AsyncStorage utilities
│   ├── styles/              # Global styles (Tailwind)
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions (revenuecat.ts, etc.)
├── app/                     # Expo Router screens
│   ├── (tabs)/              # Main tab screens (index, stats, settings)
│   └── (modals)/            # Modal screens (sound, duration, snooze)
├── assets/                  # Static assets (icons, sounds)
├── ios-modules/             # Native Swift modules (AlarmManager)
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
- Stats screen uses real streak data and calendar tracking
- Native iOS alarm system with custom sounds
- Premium features controlled via RevenueCat subscriptions
- Biome configuration enforces consistent code style and quality

## Environment Variables

### Local Development
Create a `.env` file in the project root (automatically gitignored):
```bash
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxxxxxxxxxx
EXPO_PUBLIC_ADMOB_IOS_BANNER=ca-app-pub-xxxxxxxxxxxxx/xxxxxxxxxxxxx
EXPO_PUBLIC_PREMIUM_OVERRIDE=true  # Optional: bypass subscription checks
```

### EAS Builds
Use `eas env:create` to configure secrets for each environment:
```bash
eas env:create
# Select: EXPO_PUBLIC_REVENUECAT_IOS_KEY
# Visibility: Sensitive
# Environments: development, preview, production

eas env:create
# Select: EXPO_PUBLIC_ADMOB_IOS_BANNER
# Visibility: Sensitive
# Environments: development, preview, production
```

**Important**: `.env` files are NOT uploaded to EAS. Always use `eas env:create` for remote builds.

## Premium Features

### Free Tier
- Fixed walk goal: 100 steps in 60 minutes
- Single color theme
- Ads on stats page

### Premium Tier (Monthly Subscription)
- Gradient theme color with up to 3 colors
- Custom walk goals (steps & minutes)
- Ad-free experience

### Implementation
- Premium status: `usePremium()` hook from `PremiumContext`
- RevenueCat configuration: `src/utils/revenuecat.ts`
- Paywall UI: `src/components/PaywallModal.tsx`
- Ad display: Conditional on `!isPremium` in `app/(tabs)/stats.tsx`

### Testing Premium Features
Set `EXPO_PUBLIC_PREMIUM_OVERRIDE="true"` in `.env` to bypass RevenueCat checks during development.