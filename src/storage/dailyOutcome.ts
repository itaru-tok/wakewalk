import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'stepup:daily-outcomes'

export type OutcomeResult = 'success' | 'fail'
export type SessionMode = 'alarm' | 'nap'

export interface DailyOutcome {
  dateKey: string
  mode: SessionMode
  alarmTime?: string
  wakeGoalTime?: string
  goalSteps?: number
  stopAt?: string | null
  achievedAt?: string | null
  stepsInWindow?: number | null
  outcome?: OutcomeResult
  ruleVersion: number
  updatedAt: string
}

export type DailyOutcomeMap = Record<string, DailyOutcome>

async function readMap(): Promise<DailyOutcomeMap> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {}
    }
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') {
      return parsed as DailyOutcomeMap
    }
    return {}
  } catch (error) {
    console.warn('Failed to read daily outcomes', error)
    return {}
  }
}

async function writeMap(map: DailyOutcomeMap) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch (error) {
    console.warn('Failed to write daily outcomes', error)
  }
}

export async function getDailyOutcome(dateKey: string) {
  const map = await readMap()
  return map[dateKey] ?? null
}

export async function getDailyOutcomeMap() {
  return readMap()
}

interface UpsertParams {
  dateKey: string
  patch: Partial<DailyOutcome>
  defaults?: Partial<DailyOutcome>
}

export async function upsertDailyOutcome({
  dateKey,
  patch,
  defaults,
}: UpsertParams) {
  const map = await readMap()
  const existing = map[dateKey]
  const nowIso = new Date().toISOString()
  const updated: DailyOutcome = {
    dateKey,
    ruleVersion: existing?.ruleVersion ?? defaults?.ruleVersion ?? 1,
    ...existing,
    ...defaults,
    ...patch,
    updatedAt: nowIso,
  }
  map[dateKey] = updated
  await writeMap(map)
  return updated
}

export async function overwriteDailyOutcome(
  dateKey: string,
  outcome: Omit<DailyOutcome, 'updatedAt'>,
) {
  const map = await readMap()
  map[dateKey] = {
    ...map[dateKey],
    ...outcome,
    dateKey,
    updatedAt: new Date().toISOString(),
  }
  await writeMap(map)
  return map[dateKey]
}

export async function removeDailyOutcome(dateKey: string) {
  const map = await readMap()
  if (map[dateKey]) {
    delete map[dateKey]
    await writeMap(map)
  }
}
