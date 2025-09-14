# Repository Guidelines

## Project Structure & Module Organization
- **App routes**: `app/(tabs)/` with screens (`index.tsx`, `stats.tsx`) and `_layout.tsx` via `expo-router`.
- **Source code**: Organized under `src/` directory:
  - `src/components/` - UI components (TSX)
  - `src/constants/` - Constants and theme tokens (e.g., `theme.ts`)
  - `src/styles/` - Global styles (`global.css` for Tailwind/NativeWind)
  - `src/types/` - TypeScript type definitions
- **Documentation**: `docs/` directory for project documentation
- **Config**: Root-level config files (`app.json`, `babel.config.js`, `metro.config.js`, `tsconfig.json`, `biome.json`)
- **Assets**: `assets/` directory for images, icons, and static resources

## Build, Test, and Development Commands
- `pnpm dev`: Start with Expo (tunnel mode) for quick preview.
- `pnpm ios` | `android` | `web`: Launch platform-specific bundler.
- `pnpm start`: Default Expo start.
- `pnpm typecheck`: TypeScript type checking (`tsc --noEmit`).
- `pnpm lint`: Lint codebase using Biome.
- `pnpm lint:fix`: Auto-fix linting issues with Biome.
- `pnpm format`: Format code with Biome.

## Coding Style & Naming Conventions
- **Language**: TypeScript. Components as functional components in `.tsx`.
- **Naming**: Components `PascalCase` (e.g., `ContributionGraph.tsx`), constants `camelCase`.
- **Styling**: Prefer Tailwind via `className` (NativeWind). Reuse tokens from `src/constants/theme.ts`. Keep inline `style` minimal and typed.
- **Imports**: Use relative paths from `src/` directory. Group React/Expo first, then local imports.
- **Code Quality**: Use Biome for linting and formatting. Run `pnpm lint:fix` before commits.

## Testing Guidelines
- Frameworks: Not yet configured. Recommended: Jest + React Native Testing Library.
- Location: colocate tests as `ComponentName.test.tsx` or under `__tests__/`.
- Naming: `*.test.ts`/`*.test.tsx`. Keep tests deterministic and UI focused.
- Run: once added, use `pnpm test` (add script) and aim for key-path coverage (hooks, critical screens).

## Commit & Pull Request Guidelines
- **Commits**: Short, imperative present tense (e.g., "add stats screen"). Scope optional. Group related changes.
- **PRs**: Include summary, rationale, screenshots/GIFs for UI, and steps to verify. Link issues.
- **Checks**: Run `pnpm typecheck` and `pnpm lint` before submitting. Use `pnpm lint:fix` to auto-fix issues. Confirm iOS/Android/Web screens load via `pnpm start`.

## Security & Configuration Tips
- Do not commit secrets. Use env mechanisms supported by Expo if needed.
- AsyncStorage key: `TARGET_WAKE_TIME` used by settings and hooks—maintain backward compatibility when changing.
- Router: Uses `expo-router` with `typedRoutes` enabled; keep file-based routes consistent.
