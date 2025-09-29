import { Ionicons } from '@expo/vector-icons'
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useAlarmSettings } from '../context/AlarmSettingsContext'

interface SnoozeOptionsProps {
  onBack: () => void
}

const durationOptions = [1, 3, 5]
const repeatOptions = [1, 2, 3]

export default function SnoozeOptions({ onBack }: SnoozeOptionsProps) {
  const {
    snoozeDurationMinutes,
    setSnoozeDurationMinutes,
    snoozeRepeatCount,
    setSnoozeRepeatCount,
  } = useAlarmSettings()

  return (
    <View className="flex-1 bg-black">
      <SafeAreaView className="flex-1">
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800">
          <TouchableOpacity onPress={onBack} className="p-2">
            {/* TODO: update to liquid glass icon */}
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-semibold font-comfortaa">
            Snooze
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView className="flex-1">
          {/* Snooze Duration Section */}
          <View className="mt-6">
            <Text className="text-white text-xs px-4 mb-3 font-comfortaa">
              Snooze Duration
            </Text>
            <View className="bg-gray-900 mx-4 rounded-lg overflow-hidden">
              {durationOptions.map((option, index) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setSnoozeDurationMinutes(option)}
                  className={`flex-row justify-between items-center px-4 py-3 ${
                    index > 0 ? 'border-t border-gray-800' : ''
                  }`}
                  activeOpacity={0.7}
                >
                  <Text className="text-white font-comfortaa">
                    {option} {option === 1 ? 'minute' : 'minutes'}
                  </Text>
                  {snoozeDurationMinutes === option && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#10B981"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Repeat Count Section */}
          <View className="mt-6">
            <Text className="text-white text-xs px-4 mb-3 font-comfortaa">
              Repeat Count
            </Text>
            <View className="bg-gray-900 mx-4 rounded-lg overflow-hidden">
              {repeatOptions.map((option, index) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setSnoozeRepeatCount(option)}
                  className={`flex-row justify-between items-center px-4 py-3 ${
                    index > 0 ? 'border-t border-gray-800' : ''
                  }`}
                  activeOpacity={0.7}
                >
                  <Text className="text-white font-comfortaa">
                    {option} {option === 1 ? 'time' : 'times'}
                  </Text>
                  {snoozeRepeatCount === option && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#10B981"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Info Text */}
          <View className="px-6 mt-8">
            <Text className="text-white text-sm text-center font-comfortaa">
              Your alarm will snooze for {snoozeDurationMinutes} minutes and
              repeat up to {snoozeRepeatCount} times.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}
