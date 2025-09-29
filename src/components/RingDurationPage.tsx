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

interface RingDurationPageProps {
  onBack: () => void
}

const durationCopy = (minutes: number) =>
  `${minutes} minute${minutes === 1 ? '' : 's'}`

export default function RingDurationPage({ onBack }: RingDurationPageProps) {
  const { ringDurationMinutes, setRingDurationMinutes, ringDurationOptions } =
    useAlarmSettings()

  return (
    <View className="flex-1 bg-black">
      <SafeAreaView className="flex-1">
        <StatusBar barStyle="light-content" />

        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800">
          <TouchableOpacity onPress={onBack} className="p-2">
            {/* TODO: update to liquid glass icon */}
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-semibold font-comfortaa">
            Ring Duration
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView className="flex-1">
          <View className="px-4 py-4 border-b border-gray-800">
            <Text className="text-gray-400 text-sm font-comfortaa">
              Applies to both sound and vibration.
            </Text>
          </View>

          <View className="mt-2 pb-8">
            <View className="bg-gray-900 mx-4 rounded-lg overflow-hidden border border-gray-800">
              {ringDurationOptions.map((duration, index) => (
                <TouchableOpacity
                  key={duration}
                  className={`flex-row justify-between items-center p-4 ${
                    index > 0 ? 'border-t border-gray-800' : ''
                  }`}
                  onPress={() => {
                    setRingDurationMinutes(duration)
                  }}
                  activeOpacity={0.7}
                >
                  <View>
                    <Text className="text-white font-comfortaa text-base">
                      {durationCopy(duration)}
                    </Text>
                  </View>
                  {ringDurationMinutes === duration && (
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
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}
