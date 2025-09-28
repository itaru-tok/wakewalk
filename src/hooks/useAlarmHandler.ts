import { useCallback, useRef } from 'react'
import { Alert } from 'react-native'
import { useAlarmSettings } from '../context/AlarmSettingsContext'
import {
  overwriteDailyOutcome,
  type SessionMode,
  upsertDailyOutcome,
} from '../storage/dailyOutcome'
import { addMinutes, formatClockTime, getDateKey } from '../utils/time'
import { useAlarmScheduler } from './useAlarmScheduler'
import { useWakeWalkSession } from './useWakeWalkSession'

const _TAB_BAR_HEIGHT = 30
const WALK_GOAL_MINUTES = 60
const WALK_GOAL_STEPS = 100
const RULE_VERSION = 1

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
  const { snoozeDurationMinutes } = useAlarmSettings()
  const armedSessionRef = useRef<ArmedSession | null>(null)

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
    },
    [resetSession, startTracking, setModalConfig],
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
          ? `Wake Walk session will start when alarm stops.\nWalk 100 steps within 60 minutes of set alarm time to add to your commit graph.`
          : `Wake Walk session doesn't start in nap mode.`

      const formattedTarget = formatClockTime(target)
      const message =
        mode === 'alarm'
          ? `Alarm scheduled for ${formattedTarget}.\n\n${infoLine}`
          : `Nap scheduled for ${formattedTarget}.\n\n${infoLine}`
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

  return {
    scheduledAt,
    status,
    stopAlarm: handleStopAlarm,
    snoozeAlarm: handleSnoozeAlarm,
    remainingSnoozes,
    handleArm,
    walkSession,
    resetSession,
  }
}
