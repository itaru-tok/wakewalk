import { LinearGradient } from 'expo-linear-gradient'
import { useCallback, useMemo, useState } from 'react'
import { Alert, StatusBar, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import AlarmSettings from '../../src/components/AlarmSettings'
import ScrollPicker from '../../src/components/ScrollPicker'
import SnoozeOptions from '../../src/components/SnoozeOptions'
import SoundSelectionPage from '../../src/components/SoundSelectionPage'
import RingDurationPage from '../../src/components/RingDurationPage'
import { fonts } from '../../src/constants/theme'
import { useAlarmSettings } from '../../src/context/AlarmSettingsContext'
import { useTheme } from '../../src/context/ThemeContext'
import { useAlarmScheduler } from '../../src/hooks/useAlarmScheduler'
import { getDarkerShade } from '../../src/utils/color'
import { formatHHmm } from '../../src/utils/time'

const TAB_BAR_HEIGHT = 90

const logError = (...args: Parameters<typeof console.error>) => {
  if (__DEV__) {
    console.error(...args)
  }
}

export default function HomeScreen() {
  const { themeMode, themeColor, gradientColors } = useTheme()
  const { snoozeEnabled, snoozeDurationMinutes } = useAlarmSettings()
  const insets = useSafeAreaInsets()
  const bottomPadding = useMemo(
    () => insets.bottom + TAB_BAR_HEIGHT + 12,
    [insets.bottom],
  )

  const [selectedHour, setSelectedHour] = useState(() => new Date().getHours())
  const [selectedMinute, setSelectedMinute] = useState(() =>
    new Date().getMinutes(),
  )
  const [currentPage, setCurrentPage] = useState<
    'main' | 'sound' | 'snooze' | 'duration'
  >('main')
  const {
    scheduleAlarm,
    scheduledAt,
    status,
    stopAlarm,
    snoozeAlarm,
    remainingSnoozes,
  } = useAlarmScheduler()

  const hours = useMemo(
    () => Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')),
    [],
  )
  const minutes = useMemo(
    () => Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')),
    [],
  )

  const scheduledTimeLabel = useMemo(() => {
    return scheduledAt ? formatHHmm(scheduledAt) : null
  }, [scheduledAt])

  const handleArmAlarm = useCallback(async () => {
    try {
      const target = await scheduleAlarm(selectedHour, selectedMinute)
      Alert.alert(`Alarm scheduled for ${formatHHmm(target)}.`)
    } catch (error) {
      logError('Failed to schedule alarm', error)
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Please try again.'
      Alert.alert('Failed to arm alarm', message)
    }
  }, [scheduleAlarm, selectedHour, selectedMinute])

  const handleStopAlarm = useCallback(async () => {
    try {
      await stopAlarm()
    } catch (error) {
      logError('Failed to stop alarm', error)
    }
  }, [stopAlarm])

  const handleSnoozeAlarm = useCallback(async () => {
    try {
      const next = await snoozeAlarm()
      if (next) {
        Alert.alert(
          'Snoozed',
          `Alarm snoozed for ${snoozeDurationMinutes} min. Next ring at around ${formatHHmm(next)}.`,
        )
      }
    } catch (error) {
      logError('Failed to snooze alarm', error)
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Please try again.'
      Alert.alert('Failed to snooze', message)
    }
  }, [snoozeAlarm, snoozeDurationMinutes])

  const backgroundColors = useMemo(() => {
    if (themeMode === 'color') {
      return [themeColor, getDarkerShade(themeColor), '#000000'] as const
    }
    return [...gradientColors, '#000000'] as unknown as [
      string,
      string,
      ...string[],
    ]
  }, [gradientColors, themeColor, themeMode])

  const isRinging = status === 'ringing'
  const canSnooze = snoozeEnabled && remainingSnoozes > 0 && isRinging
  const snoozeButtonLabel =
    remainingSnoozes === 1
      ? 'Snooze (1 left)'
      : `Snooze (${remainingSnoozes} left)`

  // Navigation pages will handle their own state internally
  if (currentPage === 'sound') {
    return <SoundSelectionPage onBack={() => setCurrentPage('main')} />
  }

  if (currentPage === 'duration') {
    return <RingDurationPage onBack={() => setCurrentPage('main')} />
  }

  if (currentPage === 'snooze') {
    return <SnoozeOptions onBack={() => setCurrentPage('main')} />
  }

  return (
    <LinearGradient
      colors={backgroundColors}
      style={{ flex: 1, padding: 10, paddingBottom: bottomPadding }}
      locations={themeMode === 'color' ? [0, 0.5, 1] : undefined}
    >
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View className="px-6">
          <Text
            className="text-accent text-2xl"
            style={{ fontFamily: fonts.comfortaa.bold }}
          >
            StepUp
          </Text>
        </View>

        {/* Content Container */}
        <View className="flex-1">
          {/* Time Picker Section */}
          <View className="flex-1 justify-center items-center px-6">
            <View className="relative h-[240px] w-full flex flex-row items-center justify-center">
              {/* Glass overlay around selected row */}
              <View
                pointerEvents="none"
                className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-[80px] rounded-[22px] border border-white/25 bg-white/10"
              />
              <View className="flex-1 max-w-[140px]">
                <ScrollPicker
                  items={hours}
                  selectedIndex={selectedHour}
                  onValueChange={setSelectedHour}
                  cyclic
                  rowHeight={80}
                  visibleCount={3}
                />
              </View>

              {/* Colon Separator */}
              <View className="mx-1">
                <Text
                  className="text-white text-6xl"
                  style={{ fontFamily: fonts.comfortaa.bold }}
                >
                  :
                </Text>
              </View>

              {/* Minutes Picker */}
              <View className="flex-1 max-w-[140px]">
                <ScrollPicker
                  items={minutes}
                  selectedIndex={selectedMinute}
                  onValueChange={setSelectedMinute}
                  cyclic
                  rowHeight={80}
                  visibleCount={3}
                />
              </View>
            </View>
            {/* Alarm Actions */}
            {isRinging ? (
              canSnooze ? (
                <View className="mt-4 flex-row space-x-3">
                  <TouchableOpacity
                    onPress={handleStopAlarm}
                    className="flex-1 px-7 py-3 rounded-2xl border border-white/25 bg-white/10"
                  >
                    <Text
                      className="text-white text-2xl text-center"
                      style={{ fontFamily: fonts.comfortaa.bold }}
                    >
                      Stop
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSnoozeAlarm}
                    className="flex-1 px-7 py-3 rounded-2xl border border-white/20 bg-white/5"
                  >
                    <Text
                      className="text-white text-xl text-center"
                      style={{ fontFamily: fonts.comfortaa.medium }}
                    >
                      {snoozeButtonLabel}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleStopAlarm}
                  className="mt-4 px-7 py-3 rounded-2xl border border-white/25 bg-white/10"
                >
                  <Text
                    className="text-white text-2xl text-center"
                    style={{ fontFamily: fonts.comfortaa.bold }}
                  >
                    Stop
                  </Text>
                </TouchableOpacity>
              )
            ) : (
              <TouchableOpacity
                onPress={handleArmAlarm}
                className="mt-4 px-7 py-3 rounded-2xl border border-white/25 bg-white/10"
              >
                <Text
                  className="text-white text-2xl text-center"
                  style={{ fontFamily: fonts.comfortaa.bold }}
                >
                  Sleep
                </Text>
              </TouchableOpacity>
            )}
            {scheduledTimeLabel && (
              <Text
                className="mt-2 text-white/85"
                style={{ fontFamily: fonts.comfortaa.medium }}
              >
                Scheduled time: {scheduledTimeLabel}
              </Text>
            )}
          </View>

          {/* Alarm Settings Section */}
          <View className="mt-auto">
            <AlarmSettings
              onSoundPress={() => setCurrentPage('sound')}
              onDurationPress={() => setCurrentPage('duration')}
              onSnoozePress={() => setCurrentPage('snooze')}
            />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}
