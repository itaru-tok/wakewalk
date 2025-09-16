// TODO: use SwiftUI Components from @expo/ui/swift-ui
import { Ionicons } from '@expo/vector-icons'
import Slider from '@react-native-community/slider'
import { useCallback, useMemo, useState } from 'react'
import { Switch, Text, TouchableOpacity, View } from 'react-native'
import { useTheme } from '../context/ThemeContext'
import { getColorBrightness } from '../utils/color'

interface AlarmSettingsProps {
  onSoundPress?: () => void
  onSnoozePress?: () => void
}

const soundOptions = [
  { id: 'apex', name: 'Apex', file: 'apex.mp3' },
  { id: 'beacon', name: 'Beacon', file: 'beacon.mp3' },
  { id: 'bulletin', name: 'Bulletin', file: 'bulletin.mp3' },
  { id: 'chimes', name: 'Chimes', file: 'chimes.mp3' },
  { id: 'cosmic', name: 'Cosmic', file: 'cosmic.mp3' },
]

export default function AlarmSettings({
  onSoundPress,
  onSnoozePress,
}: AlarmSettingsProps) {
  const { themeColor } = useTheme()

  // All state managed internally
  const [snoozeEnabled, setSnoozeEnabled] = useState(false)
  const [criticalAlertEnabled, setCriticalAlertEnabled] = useState(true)
  const [criticalAlertVolume, setCriticalAlertVolume] = useState(0.7)
  const [vibrateEnabled, setVibrateEnabled] = useState(true)
  const [snoozeDuration] = useState(9)
  const [snoozeRepeatCount] = useState(3)
  const [selectedSound] = useState('apex')

  const adjustedColor = useMemo(() => {
    const isDarkColor = getColorBrightness(themeColor) < 100
    return isDarkColor ? '#10B981' : themeColor
  }, [themeColor])

  const handleSwitchToggle = useCallback(
    (setter: (value: boolean) => void, value: boolean) => {
      setter(value)
    },
    [],
  )

  return (
    <View className="mx-6">
      <View
        style={{
          borderRadius: 20,
          overflow: 'hidden',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        }}
      >
        <View className="p-4">
          {/* Sound Section */}
          <View className="mb-2">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white text-lg font-comfortaa">Sound</Text>
              <TouchableOpacity
                onPress={onSoundPress}
                className="flex-row items-center"
              >
                <Text className="text-gray-400 mr-2 font-comfortaa">
                  {soundOptions.find((s) => s.id === selectedSound)?.name ||
                    'Apex'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Critical Alert Slider */}
          {/* <View className="mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white text-lg font-comfortaa">
                Critical Alert
              </Text>
              <Switch
                value={criticalAlertEnabled}
                onValueChange={(value) =>
                  handleSwitchToggle(setCriticalAlertEnabled, value)
                }
                trackColor={{ false: '#374151', true: adjustedColor }}
                thumbColor={criticalAlertEnabled ? '#ffffff' : '#9CA3AF'}
                ios_backgroundColor="#374151"
              />
            </View>
            {criticalAlertEnabled && (
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => setCriticalAlertVolume(0)}
                  className="mr-3"
                >
                  <Ionicons
                    name={
                      criticalAlertVolume === 0 ? 'volume-mute' : 'volume-low'
                    }
                    size={24}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>

                <View className="flex-1">
                  <Slider
                    value={criticalAlertVolume}
                    onValueChange={setCriticalAlertVolume}
                    minimumValue={0}
                    maximumValue={1}
                    minimumTrackTintColor={adjustedColor}
                    maximumTrackTintColor="#374151"
                    thumbTintColor="#ffffff"
                  />
                </View>

                <TouchableOpacity
                  onPress={() => setCriticalAlertVolume(1)}
                  className="ml-3"
                >
                  <Ionicons
                    name="volume-high"
                    size={24}
                    color={adjustedColor}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View> */}

          {/* Vibration Toggle */}
          <View className="mb-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-lg font-comfortaa">
                Vibration
              </Text>
              <Switch
                value={vibrateEnabled}
                onValueChange={(value) =>
                  handleSwitchToggle(setVibrateEnabled, value)
                }
                trackColor={{ false: '#374151', true: adjustedColor }}
                thumbColor={vibrateEnabled ? '#ffffff' : '#9CA3AF'}
                ios_backgroundColor="#374151"
              />
            </View>
          </View>

          {/* Snooze Toggle */}
          <View className="mb-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-lg font-comfortaa">Snooze</Text>
              <Switch
                value={snoozeEnabled}
                onValueChange={(value) =>
                  handleSwitchToggle(setSnoozeEnabled, value)
                }
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
                    {snoozeDuration} min, {snoozeRepeatCount}x
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
