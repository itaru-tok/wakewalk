// TODO: use SwiftUI Components from @expo/ui/swift-ui
import { Ionicons } from '@expo/vector-icons'
// import Slider from '@react-native-community/slider'
import { useMemo } from 'react'
import { Switch, Text, TouchableOpacity, View } from 'react-native'
import { useAlarmSettings } from '../context/AlarmSettingsContext'
import { useTheme } from '../context/ThemeContext'
import { getColorBrightness } from '../utils/color'

interface AlarmSettingsProps {
  onSoundPress?: () => void
  onSnoozePress?: () => void
  onDurationPress?: () => void
}

const soundOptions = [
  { id: 'chiangmai', name: 'chiangmai_bird', file: 'chiangmai_bird.m4a' },
  { id: 'apex', name: 'Apex', file: 'apex.mp3' },
  { id: 'beacon', name: 'Beacon', file: 'beacon.mp3' },
  { id: 'bulletin', name: 'Bulletin', file: 'bulletin.mp3' },
  { id: 'chimes', name: 'Chimes', file: 'chimes.mp3' },
  { id: 'cosmic', name: 'Cosmic', file: 'cosmic.mp3' },
]

export default function AlarmSettings({
  onSoundPress,
  onSnoozePress,
  onDurationPress,
}: AlarmSettingsProps) {
  const { themeMode, themeColor, gradientColors } = useTheme()

  // All state managed internally
  const {
    vibrationEnabled,
    setVibrationEnabled,
    selectedSoundId,
    soundEnabled,
    setSoundEnabled,
    ringDurationMinutes,
    snoozeEnabled,
    setSnoozeEnabled,
    snoozeDurationMinutes,
    snoozeRepeatCount,
  } = useAlarmSettings()

  const primaryAccent = useMemo(() => {
    if (themeMode === 'color') return themeColor
    return gradientColors[0] ?? themeColor
  }, [gradientColors, themeColor, themeMode])

  const adjustedColor = useMemo(() => {
    const isDarkColor = getColorBrightness(primaryAccent) < 100
    return isDarkColor ? '#10B981' : primaryAccent
  }, [primaryAccent])

  const selectedSoundName =
    soundOptions.find((s) => s.id === selectedSoundId)?.name ||
    selectedSoundId ||
    'Apex'

  const durationLabel = `${ringDurationMinutes} min`

  return (
    <View className="mx-6 mt-3">
      <View
        style={{
          borderRadius: 20,
          overflow: 'hidden',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        }}
      >
        <View className="p-4">
          {/* Sound Section */}
          <View>
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-lg font-comfortaa">Sound</Text>
              <Switch
                value={soundEnabled}
                onValueChange={(value) => setSoundEnabled(value)}
                trackColor={{ false: '#374151', true: adjustedColor }}
                thumbColor={soundEnabled ? '#ffffff' : '#9CA3AF'}
                ios_backgroundColor="#374151"
              />
            </View>
            {soundEnabled && (
              <TouchableOpacity
                onPress={onSoundPress}
                className="flex-row justify-between items-center mt-3"
              >
                <Text className="text-white text-base font-comfortaa">
                  Sound Type
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-gray-400 mr-2 font-comfortaa">
                    {selectedSoundName}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            )}
          </View>
          <View className="h-[1px] bg-white/15 my-3" />

          {/* Vibration Toggle */}
          <View>
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-lg font-comfortaa">
                Vibration
              </Text>
              <Switch
                value={vibrationEnabled}
                onValueChange={(value) => setVibrationEnabled(value)}
                trackColor={{ false: '#374151', true: adjustedColor }}
                thumbColor={vibrationEnabled ? '#ffffff' : '#9CA3AF'}
                ios_backgroundColor="#374151"
              />
            </View>
          </View>
          <View className="h-[1px] bg-white/15 my-3" />

          {/* Ring Duration */}
          <View>
            <TouchableOpacity
              onPress={onDurationPress}
              className="flex-row justify-between items-center"
            >
              <View className="flex-1">
                <Text className="text-white text-lg font-comfortaa">
                  Ring Duration
                </Text>
                <Text className="text-gray-400 text-sm mt-1 font-comfortaa">
                  Sound and vibration stop after {durationLabel}.
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-gray-300 mr-2 font-comfortaa">
                  {durationLabel}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          </View>
          <View className="h-[1px] bg-white/15 my-3" />

          {/* Snooze Toggle */}
          <View>
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-lg font-comfortaa">Snooze</Text>
              <Switch
                value={snoozeEnabled}
                onValueChange={(value) => setSnoozeEnabled(value)}
                trackColor={{ false: '#374151', true: adjustedColor }}
                thumbColor={snoozeEnabled ? '#ffffff' : '#9CA3AF'}
                ios_backgroundColor="#374151"
              />
            </View>
          </View>

          {/* Snooze Options */}
          {snoozeEnabled && (
            <View className="mt-2">
              <TouchableOpacity
                onPress={onSnoozePress}
                className="flex-row justify-between items-center"
              >
                <Text className="text-white text-base font-comfortaa">
                  Snooze Options
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-gray-400 mr-2 font-comfortaa text-sm">
                    {snoozeDurationMinutes} min, {snoozeRepeatCount}x
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}
