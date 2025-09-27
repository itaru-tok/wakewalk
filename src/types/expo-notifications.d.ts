declare module 'expo-notifications' {
  export type Subscription = { remove: () => void }

  export enum AndroidImportance {
    MIN = 1,
    LOW = 2,
    DEFAULT = 3,
    HIGH = 4,
    MAX = 5,
  }

  export enum AndroidNotificationVisibility {
    SECRET = -1,
    PRIVATE = 0,
    PUBLIC = 1,
  }

  export type NotificationPermissionsStatus = {
    granted: boolean
    canAskAgain: boolean
    expires: 'never' | number
  }

  export type NotificationContent = {
    title?: string
    body?: string
    data?: Record<string, unknown>
    sound?: string | null
    categoryIdentifier?: string
  }

  export type NotificationTriggerInput =
    | {
        date: Date | number
        channelId?: string
      }
    | {
        seconds: number
        repeats?: boolean
        channelId?: string
      }

  export type Notification = {
    request: {
      identifier: string
      content: NotificationContent
    }
  }

  export type NotificationResponse = {
    actionIdentifier: string
    notification: Notification
  }

  export type NotificationCategoryActionOptions = {
    isAuthenticationRequired?: boolean
    isDestructive?: boolean
    isForeground?: boolean
  }

  export type NotificationCategoryAction = {
    identifier: string
    buttonTitle: string
    options?: NotificationCategoryActionOptions
  }

  export type NotificationHandlerOptions = {
    shouldShowAlert: boolean
    shouldPlaySound: boolean
    shouldSetBadge: boolean
    priority?: 'max' | 'high' | 'default' | 'low'
  }

  export function setNotificationHandler(handler: {
    handleNotification: () =>
      | NotificationHandlerOptions
      | Promise<NotificationHandlerOptions>
    handleError?: (notificationId: string, error: Error) => void | Promise<void>
    handleSuccess?: (notificationId: string) => void | Promise<void>
  }): void

  export function setNotificationChannelAsync(
    id: string,
    channel: {
      name: string
      importance?: AndroidImportance
      sound?: string | null
      enableVibrate?: boolean
      vibrationPattern?: number[]
      bypassDnd?: boolean
      lockscreenVisibility?: AndroidNotificationVisibility
    },
  ): Promise<void>

  export function setNotificationCategoryAsync(
    id: string,
    actions: NotificationCategoryAction[],
  ): Promise<void>

  export function scheduleNotificationAsync(request: {
    content: NotificationContent
    trigger: NotificationTriggerInput | null
  }): Promise<string>

  export function cancelScheduledNotificationAsync(
    identifier: string,
  ): Promise<void>
  export function dismissNotificationAsync(identifier: string): Promise<void>
  export function dismissAllNotificationsAsync(): Promise<void>
  export function getPermissionsAsync(): Promise<NotificationPermissionsStatus>
  export function requestPermissionsAsync(): Promise<NotificationPermissionsStatus>

  export function addNotificationReceivedListener(
    listener: (notification: Notification) => void,
  ): Subscription

  export function addNotificationResponseReceivedListener(
    listener: (response: NotificationResponse) => void,
  ): Subscription
}
