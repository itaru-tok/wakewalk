import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { colors } from '../../src/constants/theme'
import { ThemeProvider } from '../../src/context/ThemeContext'

export default function TabLayout() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <NativeTabs>
          <NativeTabs.Trigger name="index">
            <Label>Alarm</Label>
            <Icon
              sf="alarm"
              drawable="custom_android_drawable"
              selectedColor={colors.primary}
            />
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="stats">
            <Icon
              sf="square.grid.3x3.topright.filled"
              drawable="custom_stats_drawable"
              selectedColor={colors.primary}
            />
            <Label>Stats</Label>
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="settings">
            <Icon
              sf="gearshape.fill"
              drawable="custom_settings_drawable"
              selectedColor={colors.primary}
            />
            <Label>Settings</Label>
          </NativeTabs.Trigger>
        </NativeTabs>
      </SafeAreaProvider>
    </ThemeProvider>
  )
}
