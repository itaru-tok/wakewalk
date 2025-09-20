import * as Haptics from 'expo-haptics'
import * as Notifications from 'expo-notifications'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Platform } from 'react-native'
import {
  DEFAULT_SOUND_ID,
  useAlarmSettings,
} from '../context/AlarmSettingsContext'
import {
  alarmEventEmitter,
  startNativeAlarm,
  stopNativeAlarm,
} from '../native/AlarmNativeModule'
import {
  ALARM_CATEGORY,
  ALARM_CHANNEL,
  ALARM_STOP_ACTION_ID,
  ensureNotificationSetup,
} from '../utils/notifications'

type AlarmStatus = 'idle' | 'armed' | 'ringing'

const SOUND_FILE_MAP: Record<string, string> = {
  [DEFAULT_SOUND_ID]: 'chiangmai_bird.m4a',
}

export function useAlarmScheduler() {
  const { ringDurationMinutes, selectedSoundId, vibrationEnabled, soundEnabled } =
    useAlarmSettings()

  const [status, setStatus] = useState<AlarmStatus>('idle')
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null)
  const scheduledNotificationIdRef = useRef<string | null>(null)
  // True while we intentionally stop/restart the native alarm to apply new settings.
  const adjustingNativeAlarmRef = useRef(false)
  const scheduledAtRef = useRef<Date | null>(null)
  const settingsUpdatePromiseRef = useRef<Promise<void> | null>(null)

  const soundFileName = useMemo(
    () => SOUND_FILE_MAP[selectedSoundId] ?? SOUND_FILE_MAP[DEFAULT_SOUND_ID],
    [selectedSoundId],
  )

  useEffect(() => {
    scheduledAtRef.current = scheduledAt
  }, [scheduledAt])

  const cancelScheduledNotification = useCallback(async () => {
    const id = scheduledNotificationIdRef.current
    if (!id) return
    try {
      await Notifications.cancelScheduledNotificationAsync(id)
    } catch (error) {
      console.error('Failed to cancel scheduled notification', error)
    } finally {
      scheduledNotificationIdRef.current = null
    }
  }, [])

  const stopAlarm = useCallback(async () => {
    await cancelScheduledNotification()
    if (Platform.OS === 'ios') {
      try {
        stopNativeAlarm()
      } catch (error) {
        console.error('Failed to stop native alarm', error)
      }
    }
    setScheduledAt(null)
    setStatus('idle')
  }, [cancelScheduledNotification])

  const requestNotificationPermission = useCallback(async () => {
    const permissions = await Notifications.getPermissionsAsync()
    if (!permissions.granted) {
      const requestResult = await Notifications.requestPermissionsAsync()
      if (!requestResult.granted) {
        throw new Error(
          'Alarm notifications are required to keep alarms reliable.',
        )
      }
    }
  }, [])

  const armAlarmForTarget = useCallback(
    async (target: Date): Promise<Date> => {
      const trigger: Notifications.NotificationTriggerInput =
        Platform.OS === 'android'
          ? { date: target, channelId: ALARM_CHANNEL }
          : { date: target }

      const notificationContent: Notifications.NotificationContent = {
        title: 'Alarm',
        body: 'Time to wake up!',
        categoryIdentifier: ALARM_CATEGORY,
        data: { scheduledAt: target.toISOString() },
      }

      notificationContent.sound = soundEnabled ? 'default' : null

      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: notificationContent,
          trigger,
        })
        scheduledNotificationIdRef.current = id
      } catch (error) {
        console.error('Failed to schedule alarm notification', error)
      }

      if (Platform.OS === 'ios') {
        try {
          startNativeAlarm(
            target,
            soundFileName,
            ringDurationMinutes,
            vibrationEnabled,
            soundEnabled,
          )
        } catch (error) {
          console.error('Failed to start native alarm', error)
        }
      } else {
        console.warn(
          'Native alarm playback is only supported on iOS. Scheduled notification only.',
        )
      }

      setScheduledAt(new Date(target))
      setStatus('armed')
      return target
    },
    [ringDurationMinutes, soundFileName, vibrationEnabled, soundEnabled],
  )

  const scheduleAlarm = useCallback(
    async (selectedHour: number, selectedMinute: number): Promise<Date> => {
      await stopAlarm()
      await ensureNotificationSetup()
      await requestNotificationPermission()

      const now = new Date()
      const target = new Date(now)
      target.setHours(selectedHour, selectedMinute, 0, 0)
      if (target <= now) {
        target.setDate(target.getDate() + 1)
      }

      return armAlarmForTarget(target)
    },
    [armAlarmForTarget, requestNotificationPermission, stopAlarm],
  )

  useEffect(() => {
    if (status !== 'armed') {
      return
    }

    let isActive = true

    // Queue a restart so the armed alarm picks up new sound/vibration settings.
    const enqueueUpdate = () => {
      const previous = settingsUpdatePromiseRef.current ?? Promise.resolve()
      const next = previous
        .catch(() => {})
        .then(async () => {
          const targetSnapshot = scheduledAtRef.current
          if (!targetSnapshot) {
            return
          }
          if (targetSnapshot.getTime() <= Date.now()) {
            return
          }
          if (!isActive) {
            return
          }

          await cancelScheduledNotification().catch(() => {})
          if (!isActive) {
            return
          }

          if (Platform.OS === 'ios') {
            // Flag this stop as internal so AlarmStopped does not reset state.
            adjustingNativeAlarmRef.current = true
            try {
              stopNativeAlarm()
            } catch (error) {
              console.error(
                'Failed to stop native alarm before updating settings',
                error,
              )
            }
          }

          if (!isActive) {
            if (Platform.OS === 'ios') {
              adjustingNativeAlarmRef.current = false
            }
            return
          }

          try {
            await armAlarmForTarget(new Date(targetSnapshot))
          } catch (error) {
            console.error('Failed to apply updated alarm settings', error)
          } finally {
            if (Platform.OS === 'ios') {
              adjustingNativeAlarmRef.current = false
            }
          }
        })

      settingsUpdatePromiseRef.current = next
      next.catch(() => {})
    }

    enqueueUpdate()

    return () => {
      isActive = false
    }
  }, [armAlarmForTarget, cancelScheduledNotification, status])

  useEffect(() => {
    if (Platform.OS !== 'ios') return

    const triggeredSub = alarmEventEmitter.addListener(
      'AlarmTriggered',
      async () => {
        await cancelScheduledNotification().catch(() => {})
        setScheduledAt(null)
        setStatus('ringing')
        if (vibrationEnabled) {
          try {
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success,
            )
          } catch (error) {
            console.warn('Failed to play haptics', error)
          }
        }
      },
    )

    const stoppedSub = alarmEventEmitter.addListener('AlarmStopped', () => {
      // Ignore synthetic stops that happen during setting adjustments.
      if (adjustingNativeAlarmRef.current) {
        return
      }
      cancelScheduledNotification().catch(() => {})
      setStatus('idle')
      setScheduledAt(null)
    })

    const armedSub = alarmEventEmitter.addListener('AlarmArmed', (payload) => {
      if (payload?.scheduledAt) {
        setScheduledAt(new Date(payload.scheduledAt))
        setStatus('armed')
      }
    })

    const errorSub = alarmEventEmitter.addListener('AlarmError', (payload) => {
      console.error('Alarm error', payload)
      setStatus('idle')
      setScheduledAt(null)
    })

    return () => {
      triggeredSub.remove()
      stoppedSub.remove()
      armedSub.remove()
      errorSub.remove()
    }
  }, [cancelScheduledNotification, vibrationEnabled])

  useEffect(() => {
    const receivedSub = Notifications.addNotificationReceivedListener(
      (notification) => {
        if (
          notification.request.content.categoryIdentifier === ALARM_CATEGORY
        ) {
          setStatus('ringing')
          setScheduledAt(null)
        }
      },
    )

    const responseSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        if (
          response.notification.request.content.categoryIdentifier !==
          ALARM_CATEGORY
        ) {
          return
        }
        if (response.actionIdentifier === ALARM_STOP_ACTION_ID) {
          stopAlarm().catch(() => {})
        }
      },
    )

    return () => {
      receivedSub.remove()
      responseSub.remove()
    }
  }, [stopAlarm])

  useEffect(() => {
    ensureNotificationSetup()?.catch(() => {})
    return () => {
      stopAlarm().catch(() => {})
    }
  }, [stopAlarm])

  return {
    status,
    scheduledAt,
    scheduleAlarm,
    stopAlarm,
  }
}
