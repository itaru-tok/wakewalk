import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
} from 'react'
import { useAsyncStorageState } from '../hooks/useAsyncStorageState'

export type AlarmStatus = 'idle' | 'armed' | 'ringing'

interface StoredAlarmState {
  status: AlarmStatus
  scheduledAt: string | null
  remainingSnoozes: number
}

interface AlarmStateContextValue {
  status: AlarmStatus
  setStatus: (status: AlarmStatus) => void
  scheduledAt: Date | null
  setScheduledAt: (date: Date | null) => void
  remainingSnoozes: number
  setRemainingSnoozes: (count: number | ((prev: number) => number)) => void
  isHydrated: boolean
}

const AlarmStateContext = createContext<AlarmStateContextValue | null>(null)

const DEFAULT_STATUS: AlarmStatus = 'idle'
const DEFAULT_SCHEDULED_AT = null
const DEFAULT_REMAINING_SNOOZES = 0

function validateAlarmState(value: unknown): value is StoredAlarmState {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  return (
    (obj.status === 'idle' ||
      obj.status === 'armed' ||
      obj.status === 'ringing') &&
    (obj.scheduledAt === null || typeof obj.scheduledAt === 'string') &&
    typeof obj.remainingSnoozes === 'number'
  )
}

export function AlarmStateProvider({ children }: { children: ReactNode }) {
  const { state, setState, isHydrated } =
    useAsyncStorageState<StoredAlarmState>({
      key: 'wakewalk:alarm-state',
      defaultValue: {
        status: DEFAULT_STATUS,
        scheduledAt: DEFAULT_SCHEDULED_AT,
        remainingSnoozes: DEFAULT_REMAINING_SNOOZES,
      },
      validate: validateAlarmState,
    })

  const setStatus = useCallback(
    (status: AlarmStatus) => {
      setState((prev) => ({ ...prev, status }))
    },
    [setState],
  )

  const setScheduledAt = useCallback(
    (date: Date | null) => {
      setState((prev) => ({
        ...prev,
        scheduledAt: date?.toISOString() ?? null,
      }))
    },
    [setState],
  )

  const setRemainingSnoozes = useCallback(
    (value: number | ((prev: number) => number)) => {
      setState((prev) => ({
        ...prev,
        remainingSnoozes:
          typeof value === 'function' ? value(prev.remainingSnoozes) : value,
      }))
    },
    [setState],
  )

  const scheduledAt = useMemo(
    () => (state.scheduledAt ? new Date(state.scheduledAt) : null),
    [state.scheduledAt],
  )

  const value = useMemo(
    () => ({
      status: state.status,
      setStatus,
      scheduledAt,
      setScheduledAt,
      remainingSnoozes: state.remainingSnoozes,
      setRemainingSnoozes,
      isHydrated,
    }),
    [
      state.status,
      state.remainingSnoozes,
      scheduledAt,
      setStatus,
      setScheduledAt,
      setRemainingSnoozes,
      isHydrated,
    ],
  )

  return (
    <AlarmStateContext.Provider value={value}>
      {children}
    </AlarmStateContext.Provider>
  )
}

export function useAlarmState() {
  const context = useContext(AlarmStateContext)
  if (!context) {
    throw new Error('useAlarmState must be used within an AlarmStateProvider')
  }
  return context
}
