import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react'
import { useAsyncStorageState } from '../hooks/useAsyncStorageState'

export type ThemeMode = 'color' | 'gradient'

interface StoredThemeSettings {
  themeMode: ThemeMode
  themeColor: string
  gradientColors: string[]
}

interface ThemeContextType {
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  themeColor: string
  setThemeColor: (color: string) => void
  gradientColors: string[]
  setGradientColors: (colors: string[]) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const DEFAULT_PRIMARY_COLOR = '#808080' // Gray color
const DEFAULT_GRADIENT_COLORS = ['#8B5CF6', '#3B82F6']

function validateThemeSettings(value: unknown): value is StoredThemeSettings {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  return (
    (obj.themeMode === 'color' || obj.themeMode === 'gradient') &&
    typeof obj.themeColor === 'string' &&
    Array.isArray(obj.gradientColors) &&
    obj.gradientColors.every((color) => typeof color === 'string')
  )
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { state, setState } = useAsyncStorageState<StoredThemeSettings>({
    key: 'wakewalk:theme-settings',
    defaultValue: {
      themeMode: 'color',
      themeColor: DEFAULT_PRIMARY_COLOR,
      gradientColors: DEFAULT_GRADIENT_COLORS,
    },
    validate: validateThemeSettings,
  })

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      setState((prev) => ({ ...prev, themeMode: mode }))
    },
    [setState],
  )

  const setThemeColor = useCallback(
    (color: string) => {
      setState((prev) => ({ ...prev, themeColor: color }))
    },
    [setState],
  )

  const setGradientColors = useCallback(
    (colors: string[]) => {
      setState((prev) => ({ ...prev, gradientColors: colors }))
    },
    [setState],
  )

  const value = useMemo(
    () => ({
      themeMode: state.themeMode,
      setThemeMode,
      themeColor: state.themeColor,
      setThemeColor,
      gradientColors: state.gradientColors,
      setGradientColors,
    }),
    [state, setThemeMode, setThemeColor, setGradientColors],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
