# StepUp Project Structure

## Directory Layout
```
step-up/
├── app/                    # Expo Router app directory
│   └── (tabs)/            # Tab navigation group
│       ├── _layout.tsx    # Tab layout configuration
│       ├── index.tsx      # Home screen (main functionality)
│       └── settings.tsx   # Settings screen (wake time config)
├── components/            # Reusable React components
│   ├── ContributionGraph.tsx  # 90-day activity visualization
│   └── SetTimeModal.tsx       # Placeholder component
├── .serena/              # Serena MCP configuration
├── node_modules/         # Dependencies (git-ignored)
├── .gitignore           # Git ignore configuration
├── app.json             # Expo app configuration
├── babel.config.js      # Babel configuration
├── CLAUDE.md            # Claude Code guidance
├── global.d.ts          # Global TypeScript definitions
├── index.js             # App entry point
├── package.json         # Project dependencies and scripts
├── pnpm-lock.yaml       # Lock file for pnpm
├── tailwind.config.js   # Tailwind/NativeWind config
└── tsconfig.json        # TypeScript configuration
```

## Key File Responsibilities

### Navigation & Routing
- `app/(tabs)/_layout.tsx`: Defines tab navigation structure
- `index.js`: Entry point that loads Expo Router

### Screens
- `app/(tabs)/index.tsx`: Main home screen with health tracking logic
- `app/(tabs)/settings.tsx`: Settings screen for wake time configuration

### Components
- `components/ContributionGraph.tsx`: Renders the visual grid of wake-up history
- `components/SetTimeModal.tsx`: Currently a placeholder component

### Configuration
- `app.json`: Expo-specific settings (name, slug, plugins)
- `tsconfig.json`: Extends Expo's TypeScript base config
- `tailwind.config.js`: NativeWind content paths configuration

### Data Flow
1. User grants health permissions on home screen
2. App queries step count data from HealthKit
3. Data is processed to determine wake status
4. Results stored in AsyncStorage with date keys
5. Contribution graph visualizes the data

### Storage Keys
- `TARGET_WAKE_TIME`: User's configured wake time
- `LAST_PROCESSED_DATE`: Optimization to avoid reprocessing