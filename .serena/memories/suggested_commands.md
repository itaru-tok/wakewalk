# Suggested Commands for WakeWalk Development

## Development Server Commands
```bash
# Start development server with tunnel (default)
pnpm dev

# Start with specific network options
pnpm dev:tunnel    # Tunnel mode with cache clear
pnpm dev:lan       # LAN mode with cache clear  
pnpm dev:local     # Localhost mode with cache clear

# Platform-specific development
pnpm ios           # Start iOS simulator
pnpm android       # Start Android emulator
pnpm web           # Start web version
```

## Code Quality Commands
```bash
# Run TypeScript type checking
pnpm typecheck

# Run ESLint linter
pnpm lint
```

## System Utilities (Darwin/macOS)
```bash
# File operations
ls -la             # List files with hidden files
find . -name "*.tsx" # Find TypeScript React files
grep -r "pattern" . # Search for pattern in files
rg "pattern"       # Faster search with ripgrep

# Git operations
git status
git add .
git commit -m "message"
git diff
git log --oneline

# Process management
ps aux | grep expo  # Find Expo processes
lsof -i :8081      # Check what's using Expo port

# File watching
fswatch -o . | xargs -n1 -I{} echo "Files changed"
```

## Package Management
```bash
# Install dependencies
pnpm install

# Add new dependency
pnpm add <package-name>

# Add dev dependency
pnpm add -D <package-name>
```

## Expo CLI Commands
```bash
# Clear cache
expo start -c

# Run doctor to diagnose issues
expo doctor

# Check Expo SDK version
expo --version
```