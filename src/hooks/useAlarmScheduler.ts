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

const IOS_NOTIFICATION_SOUND_MAP: Record<string, string> = {
  [DEFAULT_SOUND_ID]: 'chiangmai_bird.m4a',
}

export function useAlarmScheduler() {
  const { ringDurationMinutes, selectedSoundId, vibrationEnabled } =
    useAlarmSettings()

  const [status, setStatus] = useState<AlarmStatus>('idle')
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null)
  const scheduledNotificationIdRef = useRef<string | null>(null)

  const soundFileName = useMemo(
    () => SOUND_FILE_MAP[selectedSoundId] ?? SOUND_FILE_MAP[DEFAULT_SOUND_ID],
    [selectedSoundId],
  )

  const iosNotificationSound = useMemo(
    () =>
      IOS_NOTIFICATION_SOUND_MAP[selectedSoundId] ??
      IOS_NOTIFICATION_SOUND_MAP[DEFAULT_SOUND_ID],
    [selectedSoundId],
  )

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

      const trigger: Notifications.NotificationTriggerInput =
        Platform.OS === 'android'
          ? { date: target, channelId: ALARM_CHANNEL }
          : { date: target }

      try {
        const notificationContent: Notifications.NotificationContent = {
          title: 'Alarm',
          body: 'Time to wake up!',
          categoryIdentifier: ALARM_CATEGORY,
          data: { scheduledAt: target.toISOString() },
        }

        const notificationSound = vibrationEnabled ? 'default' : null
        notificationContent.sound = notificationSound

        const id = await Notifications.scheduleNotificationAsync({
          content: notificationContent,
          trigger,
        })
        scheduledNotificationIdRef.current = id
      } catch (error) {
        console.error('Failed to schedule alarm notification', error)
      }

      if (Platform.OS === 'ios') {
        startNativeAlarm(
          target,
          soundFileName,
          ringDurationMinutes,
          vibrationEnabled,
        )
      } else {
        console.warn(
          'Native alarm playback is only supported on iOS. Scheduled notification only.',
        )
      }

      setScheduledAt(target)
      setStatus('armed')
      return target
    },
    [
      iosNotificationSound,
      ringDurationMinutes,
      soundFileName,
      requestNotificationPermission,
      stopAlarm,
      vibrationEnabled,
    ],
  )

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
