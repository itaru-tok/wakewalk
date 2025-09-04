# Code Style and Conventions

## TypeScript Conventions
- **Type Annotations**: Use explicit types for function parameters and return types
- **Type Aliases**: Define custom types at the top of files (e.g., `type StatusMapValue = 'perfect' | 'good' | 'missed'`)
- **Const Assertions**: Use `as const` for constant objects like `STORAGE_KEYS`

## React/React Native Patterns
- **Functional Components**: Use function declarations (not arrow functions) for components
- **Hooks**: Follow hooks naming convention (use* prefix for custom hooks)
- **State Management**: Use React hooks (useState, useEffect, useCallback, useMemo)
- **Effect Dependencies**: Always include all dependencies in useEffect/useCallback arrays

## Naming Conventions
- **Components**: PascalCase (e.g., `HomeScreen`, `ContributionGraph`)
- **Functions**: camelCase (e.g., `formatDate`, `parseDate`)
- **Constants**: UPPER_SNAKE_CASE for module-level constants
- **Files**: 
  - Components: PascalCase.tsx (e.g., `ContributionGraph.tsx`)
  - Screens: lowercase.tsx in route folders (e.g., `index.tsx`, `settings.tsx`)

## Import Organization
1. React/React Native imports first
2. Third-party library imports
3. Local component imports
4. Type imports last

## Styling Approach
- Use NativeWind (Tailwind) classes via `className` prop
- Inline styles only when dynamic values are needed
- StyleSheet.create() for complex non-Tailwind styles

## Error Handling
- Wrap async operations in try-catch blocks
- Fail silently for non-critical operations to keep UI responsive
- Use defensive programming for external APIs (e.g., health kit import)

## Comments
- Avoid unnecessary comments
- Use comments only for complex logic or SDK compatibility notes
- Keep comments concise and relevant

## File Structure
- Group related functionality together
- Helper functions at bottom of file
- Export default component at top of component files