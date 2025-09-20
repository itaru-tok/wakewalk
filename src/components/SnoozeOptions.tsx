import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
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

type SnoozeSection = 'duration' | 'repeat' | null

export default function SnoozeOptions({ onBack }: SnoozeOptionsProps) {
  const {
    snoozeDurationMinutes,
    setSnoozeDurationMinutes,
    snoozeRepeatCount,
    setSnoozeRepeatCount,
  } = useAlarmSettings()
  const [expandedSection, setExpandedSection] = useState<SnoozeSection>(null)

  const toggleSection = (section: Exclude<SnoozeSection, null>) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <View className="flex-1 bg-black">
      <SafeAreaView className="flex-1">
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800">
          <TouchableOpacity onPress={onBack} className="p-2">
            <Ionicons name="chevron-back" size={24} color="#06B6D4" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-semibold font-comfortaa">
            Snooze
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView className="flex-1">
          {/* Duration Section */}
          <View className="mt-6">
            <TouchableOpacity
              onPress={() => toggleSection('duration')}
              className="mx-4 bg-gray-900 rounded-lg"
            >
              <View className="flex-row justify-between items-center p-4">
                <Text className="text-white text-lg font-comfortaa">
                  Snooze Duration
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-cyan-500 mr-2 font-comfortaa">
                    {snoozeDurationMinutes} min
                  </Text>
                  <Ionicons
                    name={
                      expandedSection === 'duration'
                        ? 'chevron-up'
                        : 'chevron-down'
                    }
                    size={20}
                    color="#06B6D4"
                  />
                </View>
              </View>
            </TouchableOpacity>

            {expandedSection === 'duration' && (
              <View className="mx-4 mt-2 bg-gray-900 rounded-lg overflow-hidden">
                {durationOptions.map((option, index) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => {
                      setSnoozeDurationMinutes(option)
                      setExpandedSection(null)
                    }}
                    className={`flex-row justify-between items-center p-4 ${
                      index > 0 ? 'border-t border-gray-800' : ''
                    }`}
                  >
                    <Text className="text-white font-comfortaa">
                      {option} minutes
                    </Text>
                    {snoozeDurationMinutes === option && (
                      <Ionicons name="checkmark" size={20} color="#06B6D4" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Repeat Count Section */}
          <View className="mt-6">
            <TouchableOpacity
              onPress={() => toggleSection('repeat')}
              className="mx-4 bg-gray-900 rounded-lg"
            >
              <View className="flex-row justify-between items-center p-4">
                <Text className="text-white text-lg font-comfortaa">
                  Repeat Count
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-cyan-500 mr-2 font-comfortaa">
                    {snoozeRepeatCount}x
                  </Text>
                  <Ionicons
                    name={
                      expandedSection === 'repeat'
                        ? 'chevron-up'
                        : 'chevron-down'
                    }
                    size={20}
                    color="#06B6D4"
                  />
                </View>
              </View>
            </TouchableOpacity>

            {expandedSection === 'repeat' && (
              <View className="mx-4 mt-2 bg-gray-900 rounded-lg overflow-hidden">
                {repeatOptions.map((option, index) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => {
                      setSnoozeRepeatCount(option)
                      setExpandedSection(null)
                    }}
                    className={`flex-row justify-between items-center p-4 ${
                      index > 0 ? 'border-t border-gray-800' : ''
                    }`}
                  >
                    <Text className="text-white font-comfortaa">
                      {option} {option === 1 ? 'time' : 'times'}
                    </Text>
                    {snoozeRepeatCount === option && (
                      <Ionicons name="checkmark" size={20} color="#06B6D4" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Info Text */}
          <View className="px-6 mt-8">
            <Text className="text-gray-500 text-sm text-center font-comfortaa">
              Your alarm will snooze for {snoozeDurationMinutes} minutes and
              repeat up to {snoozeRepeatCount} times.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}
