import { LinearGradient } from 'expo-linear-gradient'
import { useCallback, useState } from 'react'
import { StatusBar, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AlarmSettings from '../../src/components/AlarmSettings'
import ScrollPicker from '../../src/components/ScrollPicker'
import SnoozeOptions from '../../src/components/SnoozeOptions'
import SoundSelectionPage from '../../src/components/SoundSelectionPage'
import { useTheme } from '../../src/context/ThemeContext'
import { getDarkerShade } from '../../src/utils/color'

export default function HomeScreen() {
  const { themeMode, themeColor, gradientColors } = useTheme()

  const [selectedHour, setSelectedHour] = useState(19)
  const [selectedMinute, setSelectedMinute] = useState(30)
  const [currentPage, setCurrentPage] = useState<'main' | 'sound' | 'snooze'>(
    'main',
  )

  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0'),
  )
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0'),
  )

  const getBackgroundColors = useCallback(() => {
    if (themeMode === 'color') {
      return [themeColor, getDarkerShade(themeColor), '#000000'] as const
    } else {
      return [...gradientColors, '#000000'] as unknown as [
        string,
        string,
        ...string[],
      ]
    }
  }, [themeMode, themeColor, gradientColors])

  // Navigation pages will handle their own state internally
  if (currentPage === 'sound') {
    return <SoundSelectionPage onBack={() => setCurrentPage('main')} />
  }

  if (currentPage === 'snooze') {
    return <SnoozeOptions onBack={() => setCurrentPage('main')} />
  }

  return (
    <LinearGradient
      colors={getBackgroundColors()}
      style={{ flex: 1, padding: 10 }}
      locations={themeMode === 'color' ? [0, 0.5, 1] : undefined}
    >
      <SafeAreaView className="flex-1" edges={['top']}>
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View className="px-6">
          <Text className="font-comfortaa font-bold text-2xl">StepUp</Text>
        </View>

        {/* Content Container */}
        <View className="flex-1 justify-between">
          {/* Time Picker Section */}
          <View className="flex-1 justify-center">
            <View className="h-[300px] flex flex-row items-center justify-center px-6">
              <View className="flex-1 max-w-[120px]">
                <ScrollPicker
                  items={hours}
                  selectedIndex={selectedHour}
                  onValueChange={setSelectedHour}
                />
              </View>

              {/* Colon Separator */}
              <View className="mx-2">
                <Text
                  style={{
                    fontSize: 50,
                    color: '#ffffff',
                    fontFamily: 'Comfortaa_700Bold',
                  }}
                >
                  :
                </Text>
              </View>

              {/* Minutes Picker */}
              <View className="flex-1 max-w-[120px]">
                <ScrollPicker
                  items={minutes}
                  selectedIndex={selectedMinute}
                  onValueChange={setSelectedMinute}
                />
              </View>
            </View>
          </View>

          {/* Alarm Settings Section */}
          <View style={{ marginBottom: 110 }}>
            <AlarmSettings
              onSoundPress={() => setCurrentPage('sound')}
              onSnoozePress={() => setCurrentPage('snooze')}
            />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}
