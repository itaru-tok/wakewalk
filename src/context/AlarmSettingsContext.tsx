import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react'

const DEFAULT_RING_DURATION_MINUTES = 3
const RING_DURATION_OPTIONS_MINUTES = [1, 3, 5, 10, 15, 30] as const
export const DEFAULT_SOUND_ID = 'chiangmai'
const DEFAULT_VIBRATION_ENABLED = true
const DEFAULT_SOUND_ENABLED = true
const DEFAULT_SNOOZE_ENABLED = false
const DEFAULT_SNOOZE_DURATION_MINUTES = 3
const DEFAULT_SNOOZE_REPEAT_COUNT = 3

export const ALARM_SOUND_IDS = [DEFAULT_SOUND_ID] as const

interface AlarmSettingsContextValue {
  ringDurationMinutes: number
  setRingDurationMinutes: (minutes: number) => void
  ringDurationOptions: readonly number[]
  selectedSoundId: string
  setSelectedSoundId: (id: string) => void
  vibrationEnabled: boolean
  setVibrationEnabled: (enabled: boolean) => void
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
  snoozeEnabled: boolean
  setSnoozeEnabled: (enabled: boolean) => void
  snoozeDurationMinutes: number
  setSnoozeDurationMinutes: (minutes: number) => void
  snoozeRepeatCount: number
  setSnoozeRepeatCount: (count: number) => void
}

const AlarmSettingsContext = createContext<AlarmSettingsContextValue | null>(
  null,
)

export function AlarmSettingsProvider({ children }: { children: ReactNode }) {
  const [ringDurationMinutes, setRingDurationMinutes] = useState(
    DEFAULT_RING_DURATION_MINUTES,
  )
  const [selectedSoundId, setSelectedSoundId] = useState<string>(
    DEFAULT_SOUND_ID,
  )
  const [vibrationEnabled, setVibrationEnabled] = useState(
    DEFAULT_VIBRATION_ENABLED,
  )
  const [soundEnabled, setSoundEnabled] = useState(DEFAULT_SOUND_ENABLED)
  const [snoozeEnabled, setSnoozeEnabled] = useState(DEFAULT_SNOOZE_ENABLED)
  const [snoozeDurationMinutes, setSnoozeDurationMinutes] = useState(
    DEFAULT_SNOOZE_DURATION_MINUTES,
  )
  const [snoozeRepeatCount, setSnoozeRepeatCount] = useState(
    DEFAULT_SNOOZE_REPEAT_COUNT,
  )

  const value = useMemo(
    () => ({
      ringDurationMinutes,
      setRingDurationMinutes,
      ringDurationOptions: RING_DURATION_OPTIONS_MINUTES,
      selectedSoundId,
      setSelectedSoundId,
      vibrationEnabled,
      setVibrationEnabled,
      soundEnabled,
      setSoundEnabled,
      snoozeEnabled,
      setSnoozeEnabled,
      snoozeDurationMinutes,
      setSnoozeDurationMinutes,
      snoozeRepeatCount,
      setSnoozeRepeatCount,
    }),
    [
      ringDurationMinutes,
      selectedSoundId,
      vibrationEnabled,
      soundEnabled,
      snoozeEnabled,
      snoozeDurationMinutes,
      snoozeRepeatCount,
    ],
  )

  return (
    <AlarmSettingsContext.Provider value={value}>
      {children}
    </AlarmSettingsContext.Provider>
  )
}

export function useAlarmSettings() {
  const context = useContext(AlarmSettingsContext)
  if (!context) {
    throw new Error(
      'useAlarmSettings must be used within an AlarmSettingsProvider',
    )
  }
  return context
}
