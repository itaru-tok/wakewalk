# WakeWalk ⏰

A React Native health tracking app built with Expo that helps you build consistent wake-up habits by monitoring your step count data.

## 🎯 Overview

WakeWalk tracks your wake-up consistency using Apple Health step count data, displaying your progress in a beautiful contribution graph similar to GitHub's activity chart. The app categorizes each day based on your activity:

- **Perfect** 🟢: ≥15 steps before your target wake time
- **Good** 🟡: ≥15 steps total for the day (but not before target time)
- **Missed** ⚫: <15 steps for the day

## 📱 Features

### Core Features
- **Clean Interface**: Minimalist design with glass morphism effects
- **Time Picker**: Easy-to-use scroll picker for setting wake-up targets
- **Contribution Graph**: Visual representation of your wake-up consistency
- **Alarm System**: Native iOS alarm with customizable sounds
- **Wake Walk Session**: Track your steps immediately after waking up
- **Streak Tracking**: Current and longest wake-up streaks

### Premium Features 💎
- **Gradient theme color with up to 3 colors
- **Custom Walk Goals**: Set your own step count and time requirements
- **Ad-Free Experience**: No banner ads

### Monetization
- **AdMob Integration**: Banner ads for free users
- **RevenueCat**: In-app subscription management

## 🛠 Tech Stack

- **Framework**: React Native with Expo (SDK 54)
- **Routing**: Expo Router with typed routes
- **UI Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: React hooks with AsyncStorage
- **Monetization**: 
  - AdMob for banner ads (free users)
  - RevenueCat for subscription management
- **Native Modules**: Custom Swift module for alarm functionality
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

3. **Set up environment variables**
   
   Create a `.env` file in the project root:
   ```bash
   # RevenueCat API Key (iOS)
   EXPO_PUBLIC_REVENUECAT_IOS_KEY=your_revenuecat_api_key
   
   # AdMob Banner ID (iOS)
   EXPO_PUBLIC_ADMOB_IOS_BANNER=your_admob_banner_id
   
   # Optional: Bypass premium check for local development
   EXPO_PUBLIC_PREMIUM_OVERRIDE=true
   ```

4. **Start the development server**
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
pnpm eas:build:dev:ios        # Build development version for iOS
pnpm eas:build:preview:ios    # Build preview version for iOS
pnpm eas:build:production:ios # Build production version for iOS

# OTA Updates (JavaScript-only changes)
pnpm eas:update:preview "Bug fix message"      # Push OTA update to preview
pnpm eas:update:production "Bug fix message"   # Push OTA update to production
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

## 🔐 Environment Variables

### Local Development

Create a `.env` file in the project root (this file is gitignored):

```bash
# RevenueCat API Key for iOS
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxxxxxxxxxx

# AdMob Banner ID for iOS
EXPO_PUBLIC_ADMOB_IOS_BANNER=ca-app-pub-xxxxxxxxxxxxx/xxxxxxxxxxxxx

# Optional: Enable premium features locally without subscription
EXPO_PUBLIC_PREMIUM_OVERRIDE=true
```

**Note**: When `EXPO_PUBLIC_PREMIUM_OVERRIDE=true`, the app will bypass RevenueCat checks and always treat the user as premium. This is useful for local development and testing premium features.

### EAS Build (TestFlight & Production)

For EAS builds, environment variables must be configured using **EAS Secrets** (not committed to git):

```bash
# Configure environment variables for all environments
eas env:create

# Follow the interactive prompts:
# 1. Variable name: EXPO_PUBLIC_REVENUECAT_IOS_KEY
# 2. Variable value: appl_xxxxxxxxxxxxx
# 3. Select visibility: Sensitive
# 4. Select environments: development, preview, production

# Repeat for AdMob:
eas env:create
# 1. Variable name: EXPO_PUBLIC_ADMOB_IOS_BANNER
# 2. Variable value: ca-app-pub-xxxxxxxxxxxxx/xxxxxxxxxxxxx
# 3. Select visibility: Sensitive
# 4. Select environments: development, preview, production
```

**Verify your configuration:**
```bash
eas env:list --environment preview
eas env:list --environment production
```

### Build Profiles

The app has 4 build profiles defined in `eas.json`:

| Profile | Premium Override | Purpose |
|---------|-----------------|---------|
| **development** | No | Development builds with dev client |
| **personal** | ✅ Yes | Personal testing builds (always premium, no ads) |
| **preview** | No | TestFlight distribution (real subscription flow) |
| **production** | No | App Store release (real subscription flow) |

**Important**: `.env` files are not uploaded to EAS build servers. Always use `eas env:create` for remote builds.

## 🔄 OTA Updates

Deploy JavaScript changes instantly without App Store review:

```bash
pnpm eas:update:preview "Fix message"      # TestFlight
pnpm eas:update:production "Fix message"   # Production
```

**OTA-compatible**: JS code, assets, UI changes  
**Requires new build**: Native code, permissions, environment variables

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
