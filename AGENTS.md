# Repository Guidelines

## Project Structure & Module Organization
- app routes: `app/(tabs)/` with screens (`index.tsx`, `stats.tsx`, `settings.tsx`) and `_layout.tsx` via `expo-router`.
- UI: `components/` (TSX), shared logic: `hooks/` (e.g., `useTargetWakeTime.ts`).
- Styling: `global.css` (Tailwind), configured via `nativewind` and `tailwind.config.js`.
- Constants and tokens: `constants/` (e.g., `theme.ts`).
- Config: `app.json`, `babel.config.js`, `metro.config.js`, `tsconfig.json`.
- Assets: SVGs in repo root (e.g., `figma-*.svg`, `toggle_*.svg`).

## Build, Test, and Development Commands
- `npm run dev`: Start with Expo (web, tunnel) for quick preview.
- `npm run dev:lan` | `dev:local` | `dev:tunnel`: Start Expo with preferred connection mode.
- `npm run ios` | `android` | `web`: Launch platform-specific bundler.
- `npm run start`: Default Expo start.
- `npm run typecheck`: TypeScript type checking (`tsc --noEmit`).
- `npm run lint`: Lint codebase (ensure ESLint is installed locally).

## Coding Style & Naming Conventions
- Language: TypeScript. Components as functional components in `.tsx`.
- Naming: Components `PascalCase` (e.g., `ToggleSwitch.tsx`), hooks `camelCase` in `hooks/` (e.g., `useTargetWakeTime.ts`).
- Styling: Prefer Tailwind via `className` (NativeWind). Reuse tokens from `constants/theme.ts`. Keep inline `style` minimal and typed.
- Imports: Relative within feature folders; group React/Expo first, then local.

## Testing Guidelines
- Frameworks: Not yet configured. Recommended: Jest + React Native Testing Library.
- Location: colocate tests as `ComponentName.test.tsx` or under `__tests__/`.
- Naming: `*.test.ts`/`*.test.tsx`. Keep tests deterministic and UI focused.
- Run: once added, use `npm test` (add script) and aim for key-path coverage (hooks, critical screens).

## Commit & Pull Request Guidelines
- Commits: Short, imperative present tense (e.g., "add stats screen"). Scope optional. Group related changes.
- PRs: Include summary, rationale, screenshots/GIFs for UI, and steps to verify. Link issues.
- Checks: Run `npm run typecheck` and `npm run lint` before submitting. Confirm iOS/Android/Web screens load via `expo start`.

## Security & Configuration Tips
- Do not commit secrets. Use env mechanisms supported by Expo if needed.
- AsyncStorage key: `TARGET_WAKE_TIME` used by settings and hooks—maintain backward compatibility when changing.
- Router: Uses `expo-router` with `typedRoutes` enabled; keep file-based routes consistent.
