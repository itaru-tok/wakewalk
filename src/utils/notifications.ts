import * as Notifications from 'expo-notifications'
import { AndroidImportance, AndroidNotificationVisibility } from 'expo-notifications'
import { Platform } from 'react-native'

const ALARM_CHANNEL_ID = 'alarm-channel'
const ALARM_CATEGORY_ID = 'alarm-category'
export const ALARM_STOP_ACTION_ID = 'STOP_ALARM'

let setupPromise: Promise<void> | null = null

export function ensureNotificationSetup() {
  if (!setupPromise) {
    setupPromise = (async () => {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(ALARM_CHANNEL_ID, {
          name: 'Alarm',
          importance: AndroidImportance.MAX,
          sound: 'alarm-loop',
          enableVibrate: true,
          vibrationPattern: [0, 500, 500, 500],
          bypassDnd: true,
          lockscreenVisibility: AndroidNotificationVisibility.PUBLIC,
        })
      }

      await Notifications.setNotificationCategoryAsync(ALARM_CATEGORY_ID, [
        {
          identifier: ALARM_STOP_ACTION_ID,
          buttonTitle: 'Stop',
          options: {
            isForeground: true,
            isDestructive: true,
          },
        },
      ])

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          priority: 'max',
        }),
      })
    })()
  }

  return setupPromise
}

export const ALARM_CHANNEL = ALARM_CHANNEL_ID
export const ALARM_CATEGORY = ALARM_CATEGORY_ID
