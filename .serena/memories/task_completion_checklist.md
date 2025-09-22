# Task Completion Checklist

When completing any coding task in the WakeWalk project, ensure you:

## 1. Code Quality Checks
```bash
# Run TypeScript type checking
pnpm typecheck

# Run ESLint to check for code style issues
pnpm lint
```

## 2. Testing
- Manually test the feature on iOS simulator (`pnpm ios`)
- Check that health permissions work correctly
- Verify data persistence with AsyncStorage
- Test app state transitions (background/foreground)

## 3. Visual Verification
- Ensure NativeWind/Tailwind classes render correctly
- Check responsive layout on different screen sizes
- Verify contribution graph displays properly
- Test both light and dark mode if applicable

## 4. Error Handling
- Verify error states are handled gracefully
- Check that the app doesn't crash on permission denial
- Ensure missing data doesn't break the UI

## 5. Performance
- Check for any console warnings
- Ensure no excessive re-renders
- Verify smooth scrolling and interactions

## 6. Documentation
- Update CLAUDE.md if architecture changes significantly
- Add inline comments only for complex logic
- Ensure TypeScript types are properly defined

## Important Notes
- The app uses Japanese text (ホーム, 設定) - maintain consistency
- Health data is iOS-specific via expo-health-kit
- Minimum step count threshold is 15 steps
- Data processing happens on app foreground transition