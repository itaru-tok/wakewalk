import type { NativeModule } from 'react-native'
import { NativeEventEmitter, NativeModules, Platform } from 'react-native'

const LINKING_ERROR =
  'AlarmManager native module is not linked. Rebuild the iOS app after adding the native implementation.'

const logWarn = (...args: Parameters<typeof console.warn>) => {
  if (__DEV__) {
    console.warn(...args)
  }
}

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
  logWarn(
    `${LINKING_ERROR} If you recently added the module, rebuild and reinstall the iOS dev client.`,
  )
}

type AlarmEventSubscription = { remove: () => void }

type AlarmEventPayloads = {
  AlarmArmed: { scheduledAt?: string } | undefined
  AlarmTriggered: { triggeredAt?: string } | undefined
  AlarmStopped: undefined
  AlarmError: { message?: string } | undefined
}

type AlarmEventName = keyof AlarmEventPayloads

type AlarmEventListener<E extends AlarmEventName> = (
  payload: AlarmEventPayloads[E],
) => void

interface AlarmEventEmitter {
  addListener<E extends AlarmEventName>(
    event: E,
    listener: AlarmEventListener<E>,
  ): AlarmEventSubscription
}

class NativeAlarmEventEmitter implements AlarmEventEmitter {
  constructor(private readonly emitter: NativeEventEmitter) {}

  addListener<E extends AlarmEventName>(
    event: E,
    listener: AlarmEventListener<E>,
  ): AlarmEventSubscription {
    return this.emitter.addListener(
      event,
      listener as (...args: unknown[]) => void,
    )
  }
}

class NoopEmitter implements AlarmEventEmitter {
  addListener() {
    return { remove() {} }
  }
}

const eventModule = alarmModule as unknown as NativeModule | undefined

export const alarmEventEmitter: AlarmEventEmitter = eventModule
  ? new NativeAlarmEventEmitter(new NativeEventEmitter(eventModule))
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
