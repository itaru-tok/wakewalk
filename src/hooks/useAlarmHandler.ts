import { useCallback, useRef } from 'react'
import { Alert } from 'react-native'
import { useAlarmSettings } from '../context/AlarmSettingsContext'
import { usePremium } from '../context/PremiumContext'
import {
  overwriteDailyOutcome,
  type SessionMode,
  upsertDailyOutcome,
} from '../storage/dailyOutcome'
import { addMinutes, formatClockTime, getDateKey } from '../utils/time'
import { useAlarmScheduler } from './useAlarmScheduler'
import { useWakeWalkSession } from './useWakeWalkSession'

const RULE_VERSION = 1
const DEFAULT_WALK_GOAL_MINUTES = 60
const DEFAULT_WALK_GOAL_STEPS = 100

type ArmedSession = {
  dateKey: string
  target: Date
  wakeGoal: Date
  mode: SessionMode
}

type ModalConfig = {
  visible: boolean
  title: string
  message: string
  subMessage?: string
  buttonText?: string
}

const logError = (...args: Parameters<typeof console.error>) => {
  if (__DEV__) {
    console.error(...args)
  }
}

export function useAlarmHandler(
  selectedHour: number,
  selectedMinute: number,
  mode: SessionMode,
  setModalConfig: (config: ModalConfig) => void,
) {
  const { snoozeDurationMinutes, walkGoalMinutes, walkGoalSteps } =
    useAlarmSettings()
  const { isPremium } = usePremium()
  const armedSessionRef = useRef<ArmedSession | null>(null)

  const effectiveWalkGoalMinutes = isPremium
    ? walkGoalMinutes
    : DEFAULT_WALK_GOAL_MINUTES
  const effectiveWalkGoalSteps = isPremium
    ? walkGoalSteps
    : DEFAULT_WALK_GOAL_STEPS

  const {
    session: walkSession,
    startTracking,
    resetSession,
  } = useWakeWalkSession()

  // Common logic for both manual stop and auto-stop
  const handleAlarmStop = useCallback(
    async (isAutoStop = false) => {
      const stopAt = new Date()
      const armedSession = armedSessionRef.current
      console.log(
        `[AlarmHandler] ${isAutoStop ? 'auto-stop' : 'stop'} triggered`,
        { stopAt, armedSession },
      )

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
            goalSteps: effectiveWalkGoalSteps,
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
          subMessage: `0/${effectiveWalkGoalSteps} steps`,
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
          goalSteps: effectiveWalkGoalSteps,
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
          goalSteps: effectiveWalkGoalSteps,
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
    },
    [resetSession, startTracking, setModalConfig, effectiveWalkGoalSteps],
  )

  // Auto-stop callback for useAlarmScheduler
  const handleAutoStop = useCallback(
    () => handleAlarmStop(true),
    [handleAlarmStop],
  )

  const {
    scheduleAlarm,
    scheduledAt,
    status,
    stopAlarm,
    snoozeAlarm,
    remainingSnoozes,
  } = useAlarmScheduler(handleAutoStop)

  // Handle manual stop
  const handleStopAlarm = useCallback(async () => {
    try {
      await stopAlarm()
    } catch (error) {
      logError('Failed to stop alarm', error)
    }
    await handleAlarmStop(false)
  }, [stopAlarm, handleAlarmStop])

  // Handle arm/schedule alarm
  const handleArm = useCallback(async () => {
    resetSession()
    try {
      const target = await scheduleAlarm(selectedHour, selectedMinute)
      const wakeGoal = addMinutes(target, effectiveWalkGoalMinutes)
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
          goalSteps: effectiveWalkGoalSteps,
          stopAt: null,
          achievedAt: null,
          stepsInWindow: 0,
          ruleVersion: RULE_VERSION,
        })
      }

      const infoLine =
        mode === 'alarm'
          ? `Please ensure your device is charging during sleep for battery.\n\nAfter alarm stops, walk ${effectiveWalkGoalSteps} steps within ${effectiveWalkGoalMinutes} minutes of set alarm time to add to your commit graph🌱.`
          : `Wake Walk session doesn't start in nap mode.`

      const message =
        mode === 'alarm'
          ? `Alarm scheduled.\n\n${infoLine}`
          : `Nap scheduled.\n\n${infoLine}`
      Alert.alert(message)
    } catch (error) {
      logError('Failed to schedule alarm', error)
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Please try again.'
      Alert.alert('Failed to arm alarm', message)
    }
  }, [
    mode,
    resetSession,
    scheduleAlarm,
    selectedHour,
    selectedMinute,
    effectiveWalkGoalMinutes,
    effectiveWalkGoalSteps,
  ])

  // Handle snooze
  const handleSnoozeAlarm = useCallback(async () => {
    try {
      const next = await snoozeAlarm()
      if (next) {
        Alert.alert(
          'Snoozed',
          `Alarm snoozed for ${snoozeDurationMinutes} min. Next ring at around ${formatClockTime(next)}.`,
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

  const handleCancelAlarm = useCallback(async () => {
    try {
      await stopAlarm()
      armedSessionRef.current = null
    } catch (error) {
      logError('Failed to cancel alarm', error)
    }
  }, [stopAlarm])

  return {
    scheduledAt,
    status,
    stopAlarm: handleStopAlarm,
    cancelAlarm: handleCancelAlarm,
    snoozeAlarm: handleSnoozeAlarm,
    remainingSnoozes,
    handleArm,
    walkSession,
    resetSession,
  }
}
