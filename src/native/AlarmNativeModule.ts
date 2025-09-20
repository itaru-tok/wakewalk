import type { NativeModule } from 'react-native'
import { NativeEventEmitter, NativeModules, Platform } from 'react-native'

const LINKING_ERROR =
  'AlarmManager native module is not linked. Rebuild the iOS app after adding the native implementation.'

type AlarmManagerModule = {
  start: (
    isoString: string,
    soundName: string,
    durationSeconds: number,
    vibrationEnabled: boolean,
    soundEnabled: boolean,
  ) => void
  stop: () => void
}

const alarmModule: AlarmManagerModule | undefined =
  Platform.OS === 'ios'
    ? (NativeModules.AlarmManager as AlarmManagerModule | undefined)
    : undefined

if (Platform.OS === 'ios' && !alarmModule) {
  console.warn(
    `${LINKING_ERROR} If you recently added the module, rebuild and reinstall the iOS dev client.`,
  )
}

type AlarmEventSubscription = { remove: () => void }
type AlarmEventEmitter = {
  addListener: (event: string, listener: (...args: any[]) => void) => AlarmEventSubscription
}

class NoopEmitter implements AlarmEventEmitter {
  addListener() {
    return { remove() {} }
  }
}

const eventModule = alarmModule as unknown as NativeModule | undefined

export const alarmEventEmitter: AlarmEventEmitter = eventModule
  ? new NativeEventEmitter(eventModule)
  : new NoopEmitter()

export function startNativeAlarm(
  target: Date,
  soundFileName: string,
  durationMinutes: number,
  vibrationEnabled: boolean,
  soundEnabled: boolean,
) {
  if (!alarmModule) {
    throw new Error(LINKING_ERROR)
  }
  alarmModule.start(
    target.toISOString(),
    soundFileName,
    durationMinutes * 60,
    vibrationEnabled,
    soundEnabled,
  )
}

export function stopNativeAlarm() {
  if (!alarmModule) {
    throw new Error(LINKING_ERROR)
  }
  alarmModule.stop()
}
