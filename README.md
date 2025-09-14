# StepUp ⏰

A React Native health tracking app built with Expo that helps you build consistent wake-up habits by monitoring your step count data.

## 🎯 Overview

StepUp tracks your wake-up consistency using Apple Health step count data, displaying your progress in a beautiful contribution graph similar to GitHub's activity chart. The app categorizes each day based on your activity:

- **Perfect** 🟢: ≥15 steps before your target wake time
- **Good** 🟡: ≥15 steps total for the day (but not before target time)
- **Missed** ⚫: <15 steps for the day

## 📱 Features

- **Clean Interface**: Minimalist design with glass morphism effects
- **Time Picker**: Easy-to-use scroll picker for setting wake-up targets
- **Contribution Graph**: Visual representation of your wake-up consistency
- **Settings**: Configure sound, vibration, and snooze preferences
- **Cross-Platform**: Works on iOS, Android, and Web

## 🛠 Tech Stack

- **Framework**: React Native with Expo (SDK 54)
- **Routing**: Expo Router with typed routes
- **UI Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: React hooks with AsyncStorage
- **Language**: TypeScript
- **Code Quality**: Biome for linting and formatting
- **Package Manager**: pnpm

## 📁 Project Structure

```
├── docs/                    # Documentation
│   ├── AGENTS.md           # Development guidelines
│   └── CLAUDE.md           # AI assistant guidance
├── src/                     # Source code
│   ├── components/          # Reusable UI components
│   ├── constants/           # Theme and configuration
│   ├── styles/              # Global styles (Tailwind)
│   └── types/               # TypeScript definitions
├── app/(tabs)/              # Expo Router screens
│   ├── _layout.tsx         # Tab navigation
│   ├── index.tsx           # Main alarm screen
│   └── stats.tsx           # Statistics screen
├── assets/                  # Static assets
└── [config files]           # Root-level configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd step-up
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start the development server**
   ```bash
   pnpm dev
   ```

### Development Commands

```bash
# Development
pnpm dev              # Start with tunnel mode

# Platform-specific
pnpm ios              # Start iOS simulator
pnpm android          # Start Android emulator
pnpm web              # Start web version

# Code Quality
pnpm typecheck        # Run TypeScript checking
pnpm lint             # Run Biome linting
pnpm lint:fix         # Auto-fix linting issues
pnpm format           # Format code with Biome

# Build
pnpm build:dev:ios    # Build development version for iOS
pnpm build:preview:ios # Build preview version for iOS
```

## 🎨 Design System

The app uses a consistent design system with:

- **Colors**: Dark theme with accent colors defined in `src/constants/theme.ts`
- **Typography**: Comfortaa and Inter font families
- **Spacing**: Consistent spacing scale (xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px)
- **Components**: Reusable components with glass morphism effects

## 📊 Current Status

**Development Phase**: The app is currently in active development with mock data implementation.

### Implemented Features ✅
- Tab navigation with Alarm and Stats screens
- Time picker interface
- Settings toggles (sound, vibration, snooze)
- Contribution graph with responsive layout
- Glass morphism UI effects
- Mock data generation for development

### Planned Features 🔄
- Apple HealthKit integration
- Real step count data processing
- Push notifications for wake-up reminders
- Weekly/monthly statistics
- Export functionality

## 🧪 Development Notes

- **Mock Data**: The stats screen currently uses generated mock data for development and testing
- **Health Integration**: HealthKit integration code is prepared but commented out during development
- **Error Handling**: Simplified for development; will be enhanced for production
- **Testing**: Test framework setup is planned (Jest + React Native Testing Library)

## 🔧 Configuration

### Environment Setup
The app uses Expo's configuration system. Key configuration files:
- `app.json`: Expo app configuration
- `biome.json`: Code quality and formatting rules
- `tailwind.config.js`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration

### AsyncStorage Keys
- `TARGET_WAKE_TIME`: User's target wake time (HH:MM format)
- `LAST_PROCESSED_DATE`: Last processed date to avoid recomputation

## 📱 Screenshots

*Screenshots will be added as the app development progresses*

## 🤝 Contributing

1. **Code Style**: Follow the established patterns and use Biome for formatting
2. **Commits**: Use conventional commit messages
3. **Testing**: Run `pnpm typecheck` and `pnpm lint` before submitting
4. **Documentation**: Update relevant docs when adding features

See `docs/AGENTS.md` for detailed development guidelines.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- UI inspired by modern glass morphism design trends
- Contribution graph concept inspired by GitHub's activity chart

---

**StepUp** - Building better mornings, one step at a time! 🌅
