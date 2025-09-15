import { createContext, type ReactNode, useContext, useState } from 'react'

export type ThemeMode = 'color' | 'gradient'

interface ThemeContextType {
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  themeColor: string
  setThemeColor: (color: string) => void
  gradientColors: string[]
  setGradientColors: (colors: string[]) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const defaultPrimaryColor = '#8B5CF6' // Purple gradient color from the image
const defaultGradientColors = ['#8B5CF6', '#3B82F6']

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>('gradient')
  const [themeColor, setThemeColor] = useState(defaultPrimaryColor)
  const [gradientColors, setGradientColors] = useState(defaultGradientColors)

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        themeColor,
        setThemeColor,
        gradientColors,
        setGradientColors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
