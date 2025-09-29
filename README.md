# WakeWalk ⏰

A React Native health tracking app built with Expo that helps you build consistent wake-up habits by monitoring your step count data.

## 🎯 Overview

WakeWalk tracks your wake-up consistency using Apple Health step count data, displaying your progress in a beautiful contribution graph similar to GitHub's activity chart. The app categorizes each day based on your activity:

- **Perfect** 🟢: ≥15 steps before your target wake time
- **Good** 🟡: ≥15 steps total for the day (but not before target time)
- **Missed** ⚫: <15 steps for the day

## 📱 Features

- **Clean Interface**: Minimalist design with glass morphism effects
- **Time Picker**: Easy-to-use scroll picker for setting wake-up targets
- **Contribution Graph**: Visual representation of your wake-up consistency
- **Settings**: Configure sound, vibration, and snooze preferences
- **AdMob Integration**: Banner ads support
- **Cross-Platform**: Works on iOS, Android, and Web

## 🛠 Tech Stack

- **Framework**: React Native with Expo (SDK 54)
- **Routing**: Expo Router with typed routes
- **UI Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: React hooks with AsyncStorage
- **Monetization**: AdMob for ads
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
│   │   └── MyAdmob.tsx      # AdMob banner component
│   ├── constants/           # Theme and configuration
│   │   └── config.ts        # AdMob configuration
│   ├── context/             # React Context providers
│   │   └── PremiumContext.tsx # Premium user state management
│   └── types/               # TypeScript definitions
├── app/(tabs)/              # Expo Router screens
│   ├── _layout.tsx         # Tab navigation
│   ├── index.tsx           # Main alarm screen
│   └── stats.tsx           # Statistics screen with ads
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
   cd wakewalk
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

## 🔧 iOS Native Module Setup (Required for first-time setup)

### Custom Native Module (AlarmManager) Configuration

When setting up the project for the first time, you need to manually add native modules to the Xcode project:

1. **Run prebuild**
   ```bash
   npx expo prebuild -p ios
   ```
   This copies files from `ios-modules/` to `ios/WakeWalk/`.

2. **Open project in Xcode**
   ```bash
   open ios/WakeWalk.xcworkspace
   ```

3. **Add files to Xcode project**

   Add the following files to Xcode:
   - `AlarmManager.swift`
   - `AlarmManager.m`
   - `silence-loop.wav` (optional)

   **How to add:**
   - Open `ios/WakeWalk/` folder in Finder
   - Select the files above
   - Drag and drop them to Xcode's project navigator (WakeWalk folder on the left)
   - Check "Add to targets: WakeWalk" in the dialog

4. **Build and run**
   ```bash
   pnpm ios
   ```

### Why is manual Xcode addition necessary?

The `pnpm ios` command uses `xcodebuild` internally to build the app. This tool only includes files that are registered in the `project.pbxproj` file.

```
How it works:
ios/WakeWalk/AlarmManager.swift ← File exists physically
             ↓
project.pbxproj ← Must be registered here to be built
             ↓
WakeWalk.app ← Only registered files are included
```

Even if files exist in the filesystem, they won't be included in the app unless registered in the Xcode project. This registration is only needed once - after that, `pnpm ios` will work on its own.

### Which AlarmManager.swift is used?

It can be confusing because there are three copies in the repo:

- `ios/AlarmManager.swift` → this is the file Xcode actually compiles. Change this if you are hotfixing Swift code directly.
- `ios-modules/AlarmManager.swift` → source-of-truth for the Expo config plugin. After editing it, run `pnpm prebuild:ios` (without `--clean`) to sync the change into the native project.
- `ios/WakeWalk/AlarmManager.swift` → generated copy produced by the plugin. You normally should not edit this file; it is overwritten during prebuild.

Keep the first two files in sync if you modify the native code. A quick way is to edit `ios-modules/AlarmManager.swift` and then copy it to `ios/AlarmManager.swift` (or rerun the prebuild step) before building.

### Environment Variables (EAS)

Remember to register the public keys used in production builds. These values are safe to expose in the client binary, but they must exist when running the EAS pipeline:

```bash
eas env:create production --name EXPO_PUBLIC_REVENUECAT_IOS_KEY --value YOUR_REVENUECAT_PUB_KEY --visibility plaintext
eas env:create production --name EXPO_PUBLIC_ADMOB_IOS_BANNER --value YOUR_ADMOB_APP_ID --visibility plaintext
```

If you need the same values for other environments (preview or development), replace `production` with the desired environment name.

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

## Bug
・Killing app resets all settings...
・After missing alarm, and open the app it has still scheduled time and won't show wake walk session.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- UI inspired by modern glass morphism design trends
- Contribution graph concept inspired by GitHub's activity chart

---

**WakeWalk** - Building better mornings, one step at a time! 🌅
