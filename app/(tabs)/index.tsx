import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, AppStateStatus, Button, ScrollView, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ContributionGraph from '../../components/ContributionGraph';

// NOTE: Using any-typed import for expo-health-kit to keep the code compiling
// even if type definitions change across SDKs. The implementation follows
// the intended API: request permissions and query step counts for ranges.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Health: any = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('expo-health-kit');
  } catch (e) {
    return {};
  }
})();

type StatusMapValue = 'perfect' | 'good' | 'missed';
type StatusMap = Record<string, StatusMapValue>;

const STORAGE_KEYS = {
  targetWakeTime: 'TARGET_WAKE_TIME',
  lastProcessedDate: 'LAST_PROCESSED_DATE',
} as const;

export default function HomeScreen() {
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [data, setData] = useState<StatusMap>({});
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const requestHealthPermission = useCallback(async () => {
    try {
      if (Health?.isAvailableAsync) {
        const available = await Health.isAvailableAsync();
        if (!available) {
          setPermissionStatus('denied');
          return;
        }
      }
      const result = (await (Health?.requestPermissionsAsync?.({
        read: ['StepCount'],
      }) || Health?.requestPermissions?.({ read: ['StepCount'] }))) as any;

      const granted = typeof result === 'boolean' ? result : !!result?.granted;
      setPermissionStatus(granted ? 'granted' : 'denied');
    } catch (e) {
      setPermissionStatus('denied');
    }
  }, []);

  const onAppStateChange = useCallback(async (nextState: AppStateStatus) => {
    const prevState = appState.current;
    appState.current = nextState;
    if (prevState.match(/inactive|background/) && nextState === 'active') {
      await processDays();
    }
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', onAppStateChange);
    // Run once on mount
    processDays();
    return () => sub.remove();
  }, [onAppStateChange]);

  const parseTarget = (hhmm: string | null) => {
    if (!hhmm || !/^\d{2}:\d{2}$/.test(hhmm)) return { hour: 6, minute: 0 };
    const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10));
    return { hour: h, minute: m };
  };

  const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const setTime = (d: Date, hour: number, minute: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, minute, 0, 0);
  const dayEnd = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  const getStepCount = async (startDate: Date, endDate: Date): Promise<number> => {
    try {
      if (Health?.getStepCountAsync) {
        const n = await Health.getStepCountAsync({ startDate, endDate });
        if (typeof n === 'number') return n;
        if (n && typeof n?.value === 'number') return n.value;
      }
      if (Health?.getDailyStepCountSamples) {
        const samples = await Health.getDailyStepCountSamples({ startDate, endDate });
        const sum = Array.isArray(samples) ? samples.reduce((acc: number, s: any) => acc + (s?.value ?? 0), 0) : 0;
        return sum;
      }
    } catch (e) {
      // ignore and fall through
    }
    return 0;
  };

  const processDays = useCallback(async () => {
    try {
      const [lastProcessed, targetHHMM] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.lastProcessedDate),
        AsyncStorage.getItem(STORAGE_KEYS.targetWakeTime),
      ]);

      const now = new Date();
      const todayStr = formatDate(now);
      const { hour, minute } = parseTarget(targetHHMM);

      const startFrom = lastProcessed ? nextDateStr(lastProcessed) : todayStr; // initial run: only today
      const datesToProcess = enumerateDates(startFrom, todayStr);

      if (datesToProcess.length === 0) return;

      const updates: StatusMap = {};
      for (const ds of datesToProcess) {
        const d = parseDate(ds);
        const target = setTime(d, hour, minute);
        const preTargetSteps = await getStepCount(dayStart(d), target);
        if (preTargetSteps >= 15) {
          updates[ds] = 'perfect';
        } else {
          const total = await getStepCount(dayStart(d), dayEnd(d));
          updates[ds] = total >= 15 ? 'good' : 'missed';
        }
      }

      setData((prev) => ({ ...prev, ...updates }));
      await AsyncStorage.setItem(STORAGE_KEYS.lastProcessedDate, todayStr);
    } catch (e) {
      // no-op on error; keep UI responsive
    }
  }, []);

  const statusText = useMemo(() => {
    switch (permissionStatus) {
      case 'granted':
        return 'ステータス: 許可済み';
      case 'denied':
        return 'ステータス: 拒否';
      default:
        return 'ステータス: 未確認';
    }
  }, [permissionStatus]);

  return (
    <ScrollView className="p-4">
      <Text className="text-xl font-semibold mb-2">ホーム</Text>
      <View className="my-2">
        <Button title="ヘルスケアデータへのアクセスを許可" onPress={requestHealthPermission} />
      </View>
      <Text className="mt-2">{statusText}</Text>

      <View style={{ height: 12 }} />
      <ContributionGraph data={data} />
    </ScrollView>
  );
}

 

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map((n) => parseInt(n, 10));
  return new Date(y, m - 1, d);
}

function nextDateStr(s: string): string {
  const d = parseDate(s);
  d.setDate(d.getDate() + 1);
  return formatDate(d);
}

function enumerateDates(from: string, to: string): string[] {
  const start = parseDate(from);
  const end = parseDate(to);
  const out: string[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    out.push(formatDate(d));
  }
  return out;
}
