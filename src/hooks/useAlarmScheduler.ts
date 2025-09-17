import { Audio } from 'expo-av'
import * as Haptics from 'expo-haptics'
import { useCallback, useEffect, useRef, useState } from 'react'

const DEFAULT_ALARM_SOUND = require('../../assets/sound/chiangmai_bird.m4a')
const AUTO_STOP_DURATION_MS = 30_000

export function useAlarmScheduler() {
  const alarmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stopPlaybackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )
  const soundRef = useRef<Audio.Sound | null>(null)
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null)

  const clearScheduledAlarm = useCallback(() => {
    if (!alarmTimeoutRef.current) return
    clearTimeout(alarmTimeoutRef.current)
    alarmTimeoutRef.current = null
  }, [])

  const clearPlaybackTimeout = useCallback(() => {
    if (!stopPlaybackTimeoutRef.current) return
    clearTimeout(stopPlaybackTimeoutRef.current)
    stopPlaybackTimeoutRef.current = null
  }, [])

  const stopCurrentSound = useCallback(async () => {
    clearPlaybackTimeout()
    const sound = soundRef.current
    if (!sound) return

    try {
      await sound.stopAsync()
    } catch {}
    try {
      await sound.unloadAsync()
    } catch {}

    soundRef.current = null
  }, [clearPlaybackTimeout])

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    }).catch(() => {})

    return () => {
      clearScheduledAlarm()
      stopCurrentSound().catch(() => {})
      setScheduledAt(null)
    }
  }, [clearScheduledAlarm, stopCurrentSound])

  const scheduleAlarm = useCallback(
    async (selectedHour: number, selectedMinute: number): Promise<Date> => {
      clearScheduledAlarm()
      await stopCurrentSound()

      const now = new Date()
      const target = new Date(now)
      target.setHours(selectedHour, selectedMinute, 0, 0)
      if (target.getTime() <= now.getTime()) {
        target.setDate(target.getDate() + 1)
      }

      const triggerAtMs = target.getTime() - now.getTime()

      const startPlayback = async () => {
        try {
          const { sound } = await Audio.Sound.createAsync(DEFAULT_ALARM_SOUND, {
            shouldPlay: true,
            isLooping: true,
            volume: 1.0,
          })

          soundRef.current = sound
          clearPlaybackTimeout()

          stopPlaybackTimeoutRef.current = setTimeout(() => {
            stopCurrentSound().catch(() => {})
            setScheduledAt(null)
          }, AUTO_STOP_DURATION_MS)
          setScheduledAt(null)
        } catch (error) {
          console.error('Failed to start alarm playback', error)
          setScheduledAt(null)
          throw error
        }
      }

      setScheduledAt(target)

      if (triggerAtMs <= 0) {
        await startPlayback()
      } else {
        alarmTimeoutRef.current = setTimeout(() => {
          alarmTimeoutRef.current = null
          startPlayback().catch(() => {})
        }, triggerAtMs)
      }

      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        )
      } catch {}

      return target
    },
    [clearPlaybackTimeout, clearScheduledAlarm, stopCurrentSound],
  )

  return { scheduleAlarm, scheduledAt }
}
