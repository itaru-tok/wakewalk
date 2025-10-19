import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react'
import { useAsyncStorageState } from '../hooks/useAsyncStorageState'
import type { SessionMode } from '../storage/dailyOutcome'

interface StoredTimeSelection {
  hour: number
  minute: number
  mode: SessionMode
}

interface TimeSelectionContextValue {
  hour: number
  setHour: (hour: number) => void
  minute: number
  setMinute: (minute: number) => void
  mode: SessionMode
  setMode: (mode: SessionMode) => void
  isHydrated: boolean
}

const TimeSelectionContext = createContext<TimeSelectionContextValue | null>(
  null,
)

const DEFAULT_HOUR = 7
const DEFAULT_MINUTE = 0
const DEFAULT_MODE: SessionMode = 'alarm'

function validateTimeSelection(value: unknown): value is StoredTimeSelection {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  return (
    typeof obj.hour === 'number' &&
    obj.hour >= 0 &&
    obj.hour < 24 &&
    typeof obj.minute === 'number' &&
    obj.minute >= 0 &&
    obj.minute < 60 &&
    (obj.mode === 'alarm' || obj.mode === 'nap')
  )
}

export function TimeSelectionProvider({ children }: { children: ReactNode }) {
  const { state, setState, isHydrated } =
    useAsyncStorageState<StoredTimeSelection>({
      key: 'wakewalk:time-selection',
      defaultValue: {
        hour: DEFAULT_HOUR,
        minute: DEFAULT_MINUTE,
        mode: DEFAULT_MODE,
      },
      validate: validateTimeSelection,
    })

  const setHour = useCallback(
    (hour: number) => {
      setState((prev) => ({ ...prev, hour }))
    },
    [setState],
  )

  const setMinute = useCallback(
    (minute: number) => {
      setState((prev) => ({ ...prev, minute }))
    },
    [setState],
  )

  const setMode = useCallback(
    (mode: SessionMode) => {
      setState((prev) => ({ ...prev, mode }))
    },
    [setState],
  )

  const value = useMemo(
    () => ({
      hour: state.hour,
      setHour,
      minute: state.minute,
      setMinute,
      mode: state.mode,
      setMode,
      isHydrated,
    }),
    [
      state.hour,
      state.minute,
      state.mode,
      isHydrated,
      setHour,
      setMinute,
      setMode,
    ],
  )

  return (
    <TimeSelectionContext.Provider value={value}>
      {children}
    </TimeSelectionContext.Provider>
  )
}

export function useTimeSelection() {
  const context = useContext(TimeSelectionContext)
  if (!context) {
    throw new Error(
      'useTimeSelection must be used within a TimeSelectionProvider',
    )
  }
  return context
}
