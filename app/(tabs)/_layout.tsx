import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { colors } from '../../constants/theme'

export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <NativeTabs>
        <NativeTabs.Trigger name="index">
          <Label>Alarm</Label>
          <Icon
            sf="alarm"
            drawable="custom_android_drawable"
            selectedColor={colors.accent}
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="stats">
          <Icon
            sf="square.grid.3x3.topright.filled"
            drawable="custom_settings_drawable"
            selectedColor={colors.accent}
          />
          <Label>Stats</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </SafeAreaProvider>
  )
}
