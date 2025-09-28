import * as Notifications from 'expo-notifications'

const ALARM_CATEGORY_ID = 'alarm-category'
export const ALARM_STOP_ACTION_ID = 'STOP_ALARM'

let setupPromise: Promise<void> | null = null

export function ensureNotificationSetup() {
  if (!setupPromise) {
    setupPromise = (async () => {
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

export const ALARM_CATEGORY = ALARM_CATEGORY_ID
