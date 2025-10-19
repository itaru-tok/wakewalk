import { Button, Host } from '@expo/ui/swift-ui'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import AlarmSettings from '../../src/components/AlarmSettings'
import CommonModal from '../../src/components/CommonModal'
import ScrollPicker from '../../src/components/ScrollPicker'
import { fonts } from '../../src/constants/theme'
import { useAlarmSettings } from '../../src/context/AlarmSettingsContext'
import { useTheme } from '../../src/context/ThemeContext'
import { useTimeSelection } from '../../src/context/TimeSelectionContext'
import { useAlarmHandler } from '../../src/hooks/useAlarmHandler'
import { getDarkerShade } from '../../src/utils/color'
import { formatClockTime } from '../../src/utils/time'

function ActionButton({
  label,
  onPress,
  size = 'default',
}: {
  label: string
  onPress: () => void
  size?: 'default' | 'compact'
}) {
  const containerClasses =
    size === 'compact'
      ? 'px-6 py-2 rounded-[28px] border border-white/25 bg-white/10'
      : 'px-14 py-3 rounded-[35px] border border-white/25 bg-white/10'

  const textClasses =
    size === 'compact'
      ? 'text-white text-2xl text-center'
      : 'text-white text-4xl text-center'

  const maxLines = size === 'compact' ? 2 : 1

  return (
    <Host>
      <Button variant="borderless" onPress={onPress}>
        <View className={containerClasses}>
          <Text
            className={textClasses}
            style={{ fontFamily: fonts.comfortaa.bold }}
            numberOfLines={maxLines}
          >
            {label}
          </Text>
        </View>
      </Button>
    </Host>
  )
}

const TAB_BAR_HEIGHT = 30

const modeOptions = [
  { label: 'Sleep', value: 'alarm' as const },
  { label: 'Nap', value: 'nap' as const },
]

export default function HomeScreen() {
  const { themeMode, themeColor, gradientColors } = useTheme()
  const { snoozeEnabled } = useAlarmSettings()
  const {
    hour: selectedHour,
    setHour: setSelectedHour,
    minute: selectedMinute,
    setMinute: setSelectedMinute,
    mode,
    setMode,
    isHydrated: timeHydrated,
  } = useTimeSelection()
  const insets = useSafeAreaInsets()
  const bottomPadding = useMemo(
    () => insets.bottom + TAB_BAR_HEIGHT,
    [insets.bottom],
  )

  const [modalConfig, setModalConfig] = useState<{
    visible: boolean
    title: string
    message: string
    subMessage?: string
    buttonText?: string
  }>({ visible: false, title: '', message: '' })

  const {
    scheduledAt,
    status,
    stopAlarm,
    cancelAlarm,
    snoozeAlarm,
    remainingSnoozes,
    handleArm,
    walkSession,
    resetSession,
  } = useAlarmHandler(selectedHour, selectedMinute, mode, setModalConfig)

  const hours = useMemo(
    () => Array.from({ length: 24 }, (_, i) => i.toString()),
    [],
  )
  const minutes = useMemo(
    () => Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')),
    [],
  )

  const pickerRowHeight = 70
  const pickerVisibleCount = 3
  const pickerHeight = useMemo(() => pickerRowHeight * pickerVisibleCount, [])

  const [isPickerScrolling, setIsPickerScrolling] = useState(false)

  const scheduledTimeLabel = useMemo(() => {
    return scheduledAt ? formatClockTime(scheduledAt) : null
  }, [scheduledAt])

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

  const handlePickerScrollStart = useCallback(() => {
    setIsPickerScrolling(true)
  }, [])

  const handlePickerScrollEnd = useCallback(() => {
    setIsPickerScrolling(false)
  }, [])

  const isRinging = status === 'ringing'
  const isArmed = status === 'armed'
  const canSnooze = snoozeEnabled && remainingSnoozes > 0 && isRinging
  const snoozeButtonLabel = `Snooze (${remainingSnoozes} left)`

  // Watch for walk session changes
  useEffect(() => {
    if (!walkSession) return

    const baseConfig = {
      visible: true,
      subMessage: `${walkSession.steps}/${walkSession.goalSteps} steps`,
    }

    const configs = {
      tracking: {
        ...baseConfig,
        title: 'Wake Walk',
        message: `Keep moving! ${Math.max(0, Math.floor(walkSession.remainingMs / 60000))} minutes left`,
        buttonText: 'Stop Tracking',
      },
      success: {
        ...baseConfig,
        title: 'Committed!',
        message: 'You hit your wake walk goal.',
      },
      fail: {
        ...baseConfig,
        title: 'Missed today',
        message: 'Try tomorrow — you got this.',
      },
    }

    const config = configs[walkSession.status]
    if (config) {
      setModalConfig(config)
    }
  }, [walkSession])

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

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!isPickerScrolling}
        >
          {/* Time Picker と Action Button をグループ化 */}
          <View className="justify-center items-center px-6 pt-8">
            {/* Time Picker Section */}
            <View className="relative h-auto w-full flex flex-row items-center justify-center pb-6">
              {timeHydrated && (
                <View
                  pointerEvents="none"
                  className="absolute left-16 right-16 top-1/2 rounded-[35px] border border-white/25 bg-white/10"
                  style={{
                    transform: [{ translateY: -pickerRowHeight / 2 }],
                    height: pickerRowHeight,
                  }}
                />
              )}
              {/* Hours */}
              <View className="flex-1 max-w-[100px]">
                {timeHydrated ? (
                  <ScrollPicker
                    items={hours}
                    selectedIndex={selectedHour}
                    onValueChange={setSelectedHour}
                    onScrollStart={handlePickerScrollStart}
                    onScrollEnd={handlePickerScrollEnd}
                    cyclic
                    rowHeight={pickerRowHeight}
                    visibleCount={pickerVisibleCount}
                  />
                ) : (
                  <View style={{ height: pickerHeight }} />
                )}
              </View>

              {/* Colon Separator */}
              <View className="-mx-2">
                {timeHydrated && (
                  <Text
                    className="text-white text-6xl"
                    style={{ fontFamily: fonts.comfortaa.bold }}
                  >
                    :
                  </Text>
                )}
              </View>

              {/* Minutes */}
              <View className="flex-1 max-w-[100px]">
                {timeHydrated ? (
                  <ScrollPicker
                    items={minutes}
                    selectedIndex={selectedMinute}
                    onValueChange={setSelectedMinute}
                    onScrollStart={handlePickerScrollStart}
                    onScrollEnd={handlePickerScrollEnd}
                    cyclic
                    rowHeight={pickerRowHeight}
                    visibleCount={pickerVisibleCount}
                  />
                ) : (
                  <View style={{ height: pickerHeight }} />
                )}
              </View>
            </View>

            {/* Alarm Actions */}
            {isRinging ? (
              canSnooze ? (
                <View className="flex-row justify-center gap-x-6">
                  <View className="flex-none">
                    <ActionButton
                      label="Stop"
                      onPress={stopAlarm}
                      size="compact"
                    />
                  </View>
                  <View className="flex-none">
                    <ActionButton
                      label={snoozeButtonLabel}
                      onPress={snoozeAlarm}
                      size="compact"
                    />
                  </View>
                </View>
              ) : (
                <View>
                  <ActionButton label="Stop" onPress={stopAlarm} />
                </View>
              )
            ) : status === 'armed' ? (
              <View>
                <ActionButton label="Cancel" onPress={cancelAlarm} />
              </View>
            ) : (
              <View>
                {/* // TODO: prevent key mashing by sleep */}
                <ActionButton
                  label={mode === 'alarm' ? 'Sleep' : 'Nap'}
                  onPress={handleArm}
                />
              </View>
            )}

            {scheduledTimeLabel && (
              <Text
                className="mt-3 text-white text-3xl"
                style={{ fontFamily: fonts.comfortaa.medium }}
              >
                ⏰ {scheduledTimeLabel}
              </Text>
            )}

            {!isRinging && !isArmed && (
              <View className="flex-row bg-white/10 rounded-2xl p-1 mt-4">
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
          </View>

          {/* Alarm Settings Section */}
          <View>
            <AlarmSettings
              onSoundPress={() => router.push('/(modals)/sound')}
              onDurationPress={() => router.push('/(modals)/duration')}
              onSnoozePress={() => router.push('/(modals)/snooze')}
            />
          </View>
        </ScrollView>
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
