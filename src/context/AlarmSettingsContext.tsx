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

export const ALARM_SOUND_IDS = [DEFAULT_SOUND_ID] as const

interface AlarmSettingsContextValue {
  ringDurationMinutes: number
  setRingDurationMinutes: (minutes: number) => void
  ringDurationOptions: readonly number[]
  selectedSoundId: string
  setSelectedSoundId: (id: string) => void
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

  const value = useMemo(
    () => ({
      ringDurationMinutes,
      setRingDurationMinutes,
      ringDurationOptions: RING_DURATION_OPTIONS_MINUTES,
      selectedSoundId,
      setSelectedSoundId,
    }),
    [ringDurationMinutes, selectedSoundId],
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
