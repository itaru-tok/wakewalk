# StepUp Project Overview

## Purpose
StepUp is a React Native health tracking app that monitors wake-up habits using step count data from Apple Health (iOS). The app helps users track their morning routines by monitoring whether they achieve a minimum step count (15 steps) before their target wake time.

## Tech Stack
- **Framework**: React Native with Expo SDK 53
- **Language**: TypeScript
- **Routing**: Expo Router with typed routes
- **UI Styling**: NativeWind (Tailwind CSS for React Native) v4.0.36
- **State Management**: React hooks with AsyncStorage for persistence
- **Health Data**: expo-health-kit for Apple Health integration
- **Package Manager**: pnpm
- **Platform**: iOS (primary), with Android and web support via Expo

## Key Features
1. **Wake Status Tracking**: Determines daily wake-up success based on step count
   - Perfect: ≥15 steps before target wake time (green)
   - Good: ≥15 steps total for the day (light green)
   - Missed: <15 steps for the day (gray)

2. **Contribution Graph**: Visual 90-day grid showing wake-up history
3. **Target Time Settings**: User-configurable target wake time
4. **Automatic Data Refresh**: Updates when app becomes active using AppState listener

## Architecture Pattern
The app follows a component-based architecture with:
- Tab-based navigation structure
- Functional React components with hooks
- Centralized health data processing logic
- Defensive programming for health kit API compatibility