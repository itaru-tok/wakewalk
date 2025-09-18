import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av'
import * as Haptics from 'expo-haptics'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAlarmSettings } from '../context/AlarmSettingsContext'

const DEFAULT_ALARM_SOUND = require('../../assets/sound/chiangmai_bird.m4a')

export function useAlarmScheduler() {
  const alarmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stopPlaybackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )
  const soundRef = useRef<Audio.Sound | null>(null)
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null)
  const { ringDurationMinutes } = useAlarmSettings()
  const autoStopDurationMs = Math.max(0, Math.round(ringDurationMinutes * 60_000))
  const configureAudioMode = useCallback(async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        playThroughEarpieceAndroid: false,
      })
    } catch (error) {
      console.error('Failed to configure audio mode', error)
    }
  }, [])

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
    configureAudioMode().catch(() => {})

    return () => {
      clearScheduledAlarm()
      stopCurrentSound().catch(() => {})
      setScheduledAt(null)
    }
  }, [clearScheduledAlarm, configureAudioMode, stopCurrentSound])

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
          await configureAudioMode()
          const { sound } = await Audio.Sound.createAsync(DEFAULT_ALARM_SOUND, {
            shouldPlay: true,
            isLooping: true,
            volume: 1.0,
          })

          soundRef.current = sound
          clearPlaybackTimeout()

          if (autoStopDurationMs > 0) {
            stopPlaybackTimeoutRef.current = setTimeout(() => {
              stopCurrentSound().catch(() => {})
              setScheduledAt(null)
            }, autoStopDurationMs)
          } else {
            stopPlaybackTimeoutRef.current = null
          }
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
    [
      autoStopDurationMs,
      clearPlaybackTimeout,
      clearScheduledAlarm,
      configureAudioMode,
      stopCurrentSound,
    ],
  )

  return { scheduleAlarm, scheduledAt }
}
