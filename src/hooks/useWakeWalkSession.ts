import { Pedometer } from 'expo-sensors'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert } from 'react-native'
import { upsertDailyOutcome } from '../storage/dailyOutcome'

const logDebug = (...args: any[]) => {
  if (__DEV__) {
    console.log('[WakeWalk]', ...args)
  }
}

export type WalkSessionStatus = 'tracking' | 'success' | 'fail'

export interface WalkSessionState {
  dateKey: string
  steps: number
  goalSteps: number
  remainingMs: number
  status: WalkSessionStatus
  stopAt: Date
  wakeGoal: Date
  achievedAt?: Date | null
}

interface StartTrackingParams {
  dateKey: string
  stopAt: Date
  wakeGoal: Date
  goalSteps: number
}

const CHECK_INTERVAL_MS = 15000

export function useWakeWalkSession() {
  const [session, setSession] = useState<WalkSessionState | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeRef = useRef<StartTrackingParams | null>(null)

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const resetSession = useCallback(() => {
    activeRef.current = null
    clearTimer()
    setSession(null)
  }, [clearTimer])

  const finalizeSession = useCallback(
    async (
      params: StartTrackingParams,
      outcome: 'success' | 'fail',
      steps: number,
      achievedAt: Date | null,
    ) => {
      logDebug('finalize session', { params, outcome, steps, achievedAt })
      await upsertDailyOutcome({
        dateKey: params.dateKey,
        patch: {
          stepsInWindow: steps,
          achievedAt: achievedAt ? achievedAt.toISOString() : null,
          outcome,
        },
      })

      setSession({
        dateKey: params.dateKey,
        steps,
        goalSteps: params.goalSteps,
        remainingMs: Math.max(params.wakeGoal.getTime() - Date.now(), 0),
        status: outcome,
        stopAt: params.stopAt,
        wakeGoal: params.wakeGoal,
        achievedAt: achievedAt,
      })

      clearTimer()
      activeRef.current = null
      setSession(null)
    },
    [clearTimer],
  )

  const runCheck = useCallback(async () => {
    const params = activeRef.current
    if (!params) return

    const now = new Date()
    let steps = 0
    try {
      const result = await Pedometer.getStepCountAsync(params.stopAt, now)
      steps = result.steps ?? 0
    } catch (error) {
      console.warn('Failed to read step count', error)
    }

    const remainingMs = Math.max(params.wakeGoal.getTime() - now.getTime(), 0)
    logDebug('runCheck', { steps, stopAt: params.stopAt, now, remainingMs })

    setSession({
      dateKey: params.dateKey,
      steps,
      goalSteps: params.goalSteps,
      remainingMs,
      status: 'tracking',
      stopAt: params.stopAt,
      wakeGoal: params.wakeGoal,
    })

    if (steps >= params.goalSteps) {
      await finalizeSession(params, 'success', steps, now)
      return
    }

    if (remainingMs <= 0) {
      await finalizeSession(params, 'fail', steps, null)
      return
    }

    timeoutRef.current = setTimeout(runCheck, CHECK_INTERVAL_MS)
  }, [finalizeSession])

  const startTracking = useCallback(
    async (params: StartTrackingParams) => {
      resetSession()

      // Guard against running in a build that doesn't include the pedometer bridge.
      const hasNativeModule =
        typeof (Pedometer as any)?.isAvailableAsync === 'function' &&
        typeof (Pedometer as any)?.requestPermissionsAsync === 'function'

      if (!hasNativeModule) {
        logDebug('Pedometer native module missing')
        Alert.alert(
          'Step tracking unavailable',
          'Reinstall the dev build to enable wake walks.',
        )
        await upsertDailyOutcome({
          dateKey: params.dateKey,
          patch: {
            stepsInWindow: 0,
            achievedAt: null,
            outcome: 'fail',
          },
        })
        return
      }

      let isAvailable = false
      try {
        isAvailable = await Pedometer.isAvailableAsync()
      } catch (error) {
        logDebug('isAvailableAsync threw', error)
      }

      if (!isAvailable) {
        Alert.alert(
          'Step tracking unavailable',
          'We will skip the wake walk for now.',
        )
        await upsertDailyOutcome({
          dateKey: params.dateKey,
          patch: {
            stepsInWindow: 0,
            achievedAt: null,
            outcome: 'fail',
          },
        })
        return
      }

      let permissionGranted = false
      try {
        const permission = await Pedometer.requestPermissionsAsync()
        permissionGranted = permission?.status === 'granted'
      } catch (error) {
        logDebug('requestPermissionsAsync threw', error)
      }

      if (!permissionGranted) {
        Alert.alert(
          'Permission needed',
          'Please allow motion access to track steps.',
        )
        await upsertDailyOutcome({
          dateKey: params.dateKey,
          patch: {
            stepsInWindow: 0,
            achievedAt: null,
            outcome: 'fail',
          },
        })
        return
      }

      logDebug('begin tracking', params)
      activeRef.current = params
      setSession({
        dateKey: params.dateKey,
        steps: 0,
        goalSteps: params.goalSteps,
        remainingMs: Math.max(params.wakeGoal.getTime() - Date.now(), 0),
        status: 'tracking',
        stopAt: params.stopAt,
        wakeGoal: params.wakeGoal,
      })

      runCheck()
    },
    [finalizeSession, resetSession, runCheck],
  )

  useEffect(() => () => clearTimer(), [clearTimer])

  return {
    session,
    startTracking,
    resetSession,
  }
}
