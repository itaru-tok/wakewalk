import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react'
import {
  BUILT_IN_SOUNDS,
  type BuiltInSoundId,
  DEFAULT_SOUND_ID,
} from '../constants/sounds'
import { useAsyncStorageState } from '../hooks/useAsyncStorageState'

export { DEFAULT_SOUND_ID } from '../constants/sounds'

interface StoredAlarmSettings {
  ringDurationMinutes: number
  selectedSoundId: BuiltInSoundId
  vibrationEnabled: boolean
  soundEnabled: boolean
  snoozeEnabled: boolean
  snoozeDurationMinutes: number
  snoozeRepeatCount: number
}

const DEFAULT_RING_DURATION_MINUTES = 3
const RING_DURATION_OPTIONS_MINUTES = [1, 3, 5] as const
const DEFAULT_VIBRATION_ENABLED = true
const DEFAULT_SOUND_ENABLED = true
const DEFAULT_SNOOZE_ENABLED = false
const DEFAULT_SNOOZE_DURATION_MINUTES = 3
const DEFAULT_SNOOZE_REPEAT_COUNT = 3

export const ALARM_SOUND_IDS = BUILT_IN_SOUNDS.map((sound) => sound.id)

interface AlarmSettingsContextValue {
  ringDurationMinutes: number
  setRingDurationMinutes: (minutes: number) => void
  ringDurationOptions: readonly number[]
  selectedSoundId: BuiltInSoundId
  setSelectedSoundId: (id: BuiltInSoundId) => void
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

function validateAlarmSettings(value: unknown): value is StoredAlarmSettings {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  return (
    typeof obj.ringDurationMinutes === 'number' &&
    typeof obj.selectedSoundId === 'string' &&
    ALARM_SOUND_IDS.includes(obj.selectedSoundId as BuiltInSoundId) &&
    typeof obj.vibrationEnabled === 'boolean' &&
    typeof obj.soundEnabled === 'boolean' &&
    typeof obj.snoozeEnabled === 'boolean' &&
    typeof obj.snoozeDurationMinutes === 'number' &&
    typeof obj.snoozeRepeatCount === 'number'
  )
}

export function AlarmSettingsProvider({ children }: { children: ReactNode }) {
  const { state, setState } = useAsyncStorageState<StoredAlarmSettings>({
    key: 'wakewalk:alarm-settings',
    defaultValue: {
      ringDurationMinutes: DEFAULT_RING_DURATION_MINUTES,
      selectedSoundId: DEFAULT_SOUND_ID,
      vibrationEnabled: DEFAULT_VIBRATION_ENABLED,
      soundEnabled: DEFAULT_SOUND_ENABLED,
      snoozeEnabled: DEFAULT_SNOOZE_ENABLED,
      snoozeDurationMinutes: DEFAULT_SNOOZE_DURATION_MINUTES,
      snoozeRepeatCount: DEFAULT_SNOOZE_REPEAT_COUNT,
    },
    validate: validateAlarmSettings,
  })

  const setRingDurationMinutes = useCallback(
    (minutes: number) => {
      setState((prev) => ({ ...prev, ringDurationMinutes: minutes }))
    },
    [setState],
  )

  const setSelectedSoundId = useCallback(
    (id: BuiltInSoundId) => {
      setState((prev) => ({ ...prev, selectedSoundId: id }))
    },
    [setState],
  )

  const setVibrationEnabled = useCallback(
    (enabled: boolean) => {
      setState((prev) => ({ ...prev, vibrationEnabled: enabled }))
    },
    [setState],
  )

  const setSoundEnabled = useCallback(
    (enabled: boolean) => {
      setState((prev) => ({ ...prev, soundEnabled: enabled }))
    },
    [setState],
  )

  const setSnoozeEnabled = useCallback(
    (enabled: boolean) => {
      setState((prev) => ({ ...prev, snoozeEnabled: enabled }))
    },
    [setState],
  )

  const setSnoozeDurationMinutes = useCallback(
    (minutes: number) => {
      setState((prev) => ({ ...prev, snoozeDurationMinutes: minutes }))
    },
    [setState],
  )

  const setSnoozeRepeatCount = useCallback(
    (count: number) => {
      setState((prev) => ({ ...prev, snoozeRepeatCount: count }))
    },
    [setState],
  )

  const value = useMemo(
    () => ({
      ringDurationMinutes: state.ringDurationMinutes,
      setRingDurationMinutes,
      ringDurationOptions: RING_DURATION_OPTIONS_MINUTES,
      selectedSoundId: state.selectedSoundId,
      setSelectedSoundId,
      vibrationEnabled: state.vibrationEnabled,
      setVibrationEnabled,
      soundEnabled: state.soundEnabled,
      setSoundEnabled,
      snoozeEnabled: state.snoozeEnabled,
      setSnoozeEnabled,
      snoozeDurationMinutes: state.snoozeDurationMinutes,
      setSnoozeDurationMinutes,
      snoozeRepeatCount: state.snoozeRepeatCount,
      setSnoozeRepeatCount,
    }),
    [
      state,
      setRingDurationMinutes,
      setSelectedSoundId,
      setVibrationEnabled,
      setSoundEnabled,
      setSnoozeEnabled,
      setSnoozeDurationMinutes,
      setSnoozeRepeatCount,
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
