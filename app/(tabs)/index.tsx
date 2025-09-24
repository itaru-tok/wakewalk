import { Button, Host } from '@expo/ui/swift-ui'
import { LinearGradient } from 'expo-linear-gradient'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, StatusBar, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import AlarmSettings from '../../src/components/AlarmSettings'
import CommonModal from '../../src/components/CommonModal'
import RingDurationPage from '../../src/components/RingDurationPage'
import ScrollPicker from '../../src/components/ScrollPicker'
import SnoozeOptions from '../../src/components/SnoozeOptions'
import SoundSelectionPage from '../../src/components/SoundSelectionPage'
import { fonts } from '../../src/constants/theme'
import { useAlarmSettings } from '../../src/context/AlarmSettingsContext'
import { useTheme } from '../../src/context/ThemeContext'
import { useAlarmScheduler } from '../../src/hooks/useAlarmScheduler'
import { useWakeWalkSession } from '../../src/hooks/useWakeWalkSession'
import {
  overwriteDailyOutcome,
  type SessionMode,
  upsertDailyOutcome,
} from '../../src/storage/dailyOutcome'
import { getDarkerShade } from '../../src/utils/color'
import { addMinutes, formatHHmm, getDateKey } from '../../src/utils/time'

function ActionButton({
  label,
  onPress,
}: {
  label: string
  onPress: () => void
}) {
  return (
    <Host>
      <Button variant="borderless" onPress={onPress}>
        <View className="px-14 py-3 rounded-[35px] border border-white/25 bg-white/10">
          <Text
            className="text-white text-4xl text-center"
            style={{ fontFamily: fonts.comfortaa.bold }}
          >
            {label}
          </Text>
        </View>
      </Button>
    </Host>
  )
}

const TAB_BAR_HEIGHT = 30
const WALK_GOAL_MINUTES = 60
const WALK_GOAL_STEPS = 100
const RULE_VERSION = 1

type ArmPage = 'main' | 'sound' | 'snooze' | 'duration'

type ArmedSession = {
  dateKey: string
  target: Date
  wakeGoal: Date
  mode: SessionMode
}

const modeOptions: { label: string; value: SessionMode }[] = [
  { label: 'Sleep', value: 'alarm' },
  { label: 'Nap', value: 'nap' },
]

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
    () => insets.bottom + TAB_BAR_HEIGHT,
    [insets.bottom],
  )

  const [selectedHour, setSelectedHour] = useState(() => new Date().getHours())
  const [selectedMinute, setSelectedMinute] = useState(() =>
    new Date().getMinutes(),
  )
  const [currentPage, setCurrentPage] = useState<ArmPage>('main')
  const [mode, setMode] = useState<SessionMode>('alarm')
  const armedSessionRef = useRef<ArmedSession | null>(null)
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean
    title: string
    message: string
    subMessage?: string
    buttonText?: string
  }>({ visible: false, title: '', message: '' })

  const {
    scheduleAlarm,
    scheduledAt,
    status,
    stopAlarm,
    snoozeAlarm,
    remainingSnoozes,
  } = useAlarmScheduler()

  const {
    session: walkSession,
    startTracking,
    resetSession,
  } = useWakeWalkSession()

  const hours = useMemo(
    () => Array.from({ length: 24 }, (_, i) => i.toString()),
    [],
  )
  const minutes = useMemo(
    () => Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')),
    [],
  )

  const scheduledTimeLabel = useMemo(() => {
    return scheduledAt ? formatHHmm(scheduledAt) : null
  }, [scheduledAt])

  const handleArm = useCallback(async () => {
    resetSession()
    try {
      const target = await scheduleAlarm(selectedHour, selectedMinute)
      const wakeGoal = addMinutes(target, WALK_GOAL_MINUTES)
      const dateKey = getDateKey(target)

      armedSessionRef.current = {
        dateKey,
        target,
        wakeGoal,
        mode,
      }

      if (mode === 'alarm') {
        await overwriteDailyOutcome(dateKey, {
          dateKey,
          mode: 'alarm',
          alarmTime: target.toISOString(),
          wakeGoalTime: wakeGoal.toISOString(),
          goalSteps: WALK_GOAL_STEPS,
          stopAt: null,
          achievedAt: null,
          stepsInWindow: 0,
          ruleVersion: RULE_VERSION,
        })
      }

      const infoLine =
        mode === 'alarm'
          ? `After it rings, tap Stop to start Wake Walk session.\nWalk 100 steps within 60 minutes of set alarm time to add to your commit graph.`
          : `Wake Walk session doesn’t start in nap mode.`

      const message =
        mode === 'alarm'
          ? `Alarm scheduled for ${formatHHmm(target)}.\n\n${infoLine}`
          : `Nap scheduled for ${formatHHmm(target)}.\n\n${infoLine}`
      Alert.alert(message)
    } catch (error) {
      logError('Failed to schedule alarm', error)
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Please try again.'
      Alert.alert('Failed to arm alarm', message)
    }
  }, [mode, resetSession, scheduleAlarm, selectedHour, selectedMinute])

  const handleStopAlarm = useCallback(async () => {
    const stopAt = new Date()
    const armedSession = armedSessionRef.current
    console.log('[AlarmScreen] stop pressed', { stopAt, armedSession })

    try {
      await stopAlarm()
    } catch (error) {
      logError('Failed to stop alarm', error)
    }

    if (!armedSession || armedSession.mode !== 'alarm') {
      armedSessionRef.current = null
      resetSession()
      return
    }

    const { dateKey, wakeGoal, target } = armedSession

    if (stopAt >= wakeGoal) {
      await upsertDailyOutcome({
        dateKey,
        patch: {
          mode: 'alarm',
          alarmTime: target.toISOString(),
          wakeGoalTime: wakeGoal.toISOString(),
          goalSteps: WALK_GOAL_STEPS,
          stopAt: stopAt.toISOString(),
          achievedAt: null,
          stepsInWindow: 0,
          outcome: 'fail',
          ruleVersion: RULE_VERSION,
        },
      })
      setModalConfig({
        visible: true,
        title: 'Missed today',
        message: 'Try tomorrow — you got this.',
        subMessage: `0/${WALK_GOAL_STEPS} steps`,
      })
      armedSessionRef.current = null
      resetSession()
      return
    }

    await upsertDailyOutcome({
      dateKey,
      patch: {
        mode: 'alarm',
        alarmTime: target.toISOString(),
        wakeGoalTime: wakeGoal.toISOString(),
        goalSteps: WALK_GOAL_STEPS,
        stopAt: stopAt.toISOString(),
        achievedAt: null,
        stepsInWindow: 0,
        ruleVersion: RULE_VERSION,
      },
    })

    try {
      await startTracking({
        dateKey,
        stopAt,
        wakeGoal,
        goalSteps: WALK_GOAL_STEPS,
      })
    } catch (error) {
      logError('Failed to start wake walk tracking', error)
      setModalConfig({
        visible: true,
        title: 'Step tracking unavailable',
        message: 'Please reopen the app after reinstalling the dev build.',
      })
      resetSession()
    } finally {
      armedSessionRef.current = null
    }
  }, [resetSession, startTracking, stopAlarm])

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

  // Watch for walk session changes
  useEffect(() => {
    if (!walkSession) return

    if (walkSession.status === 'tracking') {
      // Show progress modal while tracking
      const remainingMinutes = Math.max(
        0,
        Math.floor(walkSession.remainingMs / 60000),
      )
      setModalConfig({
        visible: true,
        title: 'Wake Walk',
        message: `Keep moving! ${remainingMinutes} minutes left`,
        subMessage: `${walkSession.steps}/${walkSession.goalSteps} steps`,
        buttonText: 'Stop Tracking',
      })
    } else if (walkSession.status === 'success') {
      setModalConfig({
        visible: true,
        title: 'Committed!',
        message: 'You hit your wake walk goal.',
        subMessage: `${walkSession.steps}/${walkSession.goalSteps} steps`,
      })
    } else if (walkSession.status === 'fail') {
      setModalConfig({
        visible: true,
        title: 'Missed today',
        message: 'Try tomorrow — you got this.',
        subMessage: `${walkSession.steps}/${walkSession.goalSteps} steps`,
      })
    }
  }, [walkSession])

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
            WakeWalk
          </Text>
        </View>

        {/* Content Container */}
        <View className="flex-1">
          {/* Time Picker Section */}
          <View className="flex-1 justify-center items-center px-6">
            <View className="relative h-auto w-full flex flex-row items-center justify-center">
              {/* Glass overlay around selected row */}
              <View
                pointerEvents="none"
                className="absolute left-16 right-16 top-1/2 -translate-y-1/2 h-[70px] rounded-[35px] border border-white/25 bg-white/10"
              />
              <View className="flex-1 max-w-[100px]">
                <ScrollPicker
                  items={hours}
                  selectedIndex={selectedHour}
                  onValueChange={setSelectedHour}
                  cyclic
                  rowHeight={70}
                  visibleCount={3}
                />
              </View>

              {/* Colon Separator */}
              <View className="-mx-2">
                <Text
                  className="text-white text-6xl"
                  style={{ fontFamily: fonts.comfortaa.bold }}
                >
                  :
                </Text>
              </View>

              {/* Minutes Picker */}
              <View className="flex-1 max-w-[100px]">
                <ScrollPicker
                  items={minutes}
                  selectedIndex={selectedMinute}
                  onValueChange={setSelectedMinute}
                  cyclic
                  rowHeight={70}
                  visibleCount={3}
                />
              </View>
            </View>

            {!isRinging && (
              <View className="flex-row bg-white/10 rounded-2xl p-1 mt-6">
                {modeOptions.map((option) => {
                  const isActive = mode === option.value
                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setMode(option.value)}
                      className={`flex-1 px-4 py-2 rounded-xl ${
                        isActive ? 'bg-white/20' : 'bg-transparent'
                      }`}
                    >
                      <Text
                        className={`text-center text-base ${
                          isActive ? 'text-white' : 'text-white/70'
                        }`}
                        style={{
                          fontFamily: isActive
                            ? fonts.comfortaa.bold
                            : fonts.comfortaa.medium,
                        }}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            )}

            {/* Alarm Actions */}
            {isRinging ? (
              canSnooze ? (
                <View className="mt-4 flex-row space-x-3">
                  <View className="flex-1">
                    <ActionButton label="Stop" onPress={handleStopAlarm} />
                  </View>
                  <View className="flex-1">
                    <ActionButton
                      label={snoozeButtonLabel}
                      onPress={handleSnoozeAlarm}
                    />
                  </View>
                </View>
              ) : (
                <View className="mt-4">
                  <ActionButton label="Stop" onPress={handleStopAlarm} />
                </View>
              )
            ) : (
              <View className="mt-4">
                <ActionButton
                  label={mode === 'alarm' ? 'Sleep' : 'Nap'}
                  onPress={handleArm}
                />
              </View>
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

        <CommonModal
          visible={modalConfig.visible}
          title={modalConfig.title}
          message={modalConfig.message}
          subMessage={modalConfig.subMessage}
          buttonText={modalConfig.buttonText}
          onDismiss={() => {
            setModalConfig({ ...modalConfig, visible: false })
            // Stop tracking or reset session based on status
            if (walkSession) {
              if (walkSession.status === 'tracking') {
                // Stop tracking when user clicks Stop Tracking
                resetSession()
              } else if (
                walkSession.status === 'success' ||
                walkSession.status === 'fail'
              ) {
                // Reset session when dismissing success/fail modals
                resetSession()
              }
            }
          }}
        />
      </SafeAreaView>
    </LinearGradient>
  )
}
