import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

type Status = 'perfect' | 'good' | 'missed';
export type ContributionData = Record<string, Status>;

type Props = {
  data?: ContributionData;
  days?: number; // default 90
  size?: number; // cell size
  gap?: number; // cell gap
};

export default function ContributionGraph({ data = {}, days = 90, size = 14, gap = 3 }: Props) {
  const today = useMemo(() => new Date(), []);

  const dates = useMemo(() => {
    const out: Date[] = [];
    const start = new Date(today);
    start.setDate(start.getDate() - (days - 1));
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      out.push(d);
    }
    return out;
  }, [today, days]);

  const cols = Math.ceil(days / 7);
  const width = Dimensions.get('window').width;
  const colWidth = size + gap;
  const maxCols = Math.floor((width - 32) / colWidth); // with horizontal padding
  const renderCols = Math.min(cols, Math.max(1, maxCols));

  const colorFor = (iso: string): string => {
    const v = data[iso];
    if (!v) return '#e5e7eb'; // default light gray
    switch (v) {
      case 'perfect':
        return '#22c55e';
      case 'good':
        return '#86efac';
      case 'missed':
      default:
        return '#d1d5db';
    }
  };

  // Arrange by columns (weeks), top-to-bottom is Sun..Sat for simplicity
  const grid: { iso: string; date: Date }[][] = [];
  for (let c = 0; c < cols; c++) grid[c] = [];
  dates.forEach((d, idx) => {
    const c = Math.floor(idx / 7);
    grid[c].push({ iso: toISO(d), date: d });
  });

  return (
    <View className="px-4" style={[styles.container]}>  
      <View style={[styles.row, { gap }]}>  
        {grid.slice(-renderCols).map((column, ci) => (
          <View key={ci} style={[styles.col, { gap }]}>
            {Array.from({ length: 7 }).map((_, ri) => {
              const cell = column[ri];
              const iso = cell ? cell.iso : undefined;
              return (
                <View
                  key={ri}
                  style={{ width: size, height: size, borderRadius: 3, backgroundColor: iso ? colorFor(iso) : '#f3f4f6' }}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const styles = StyleSheet.create({
  container: { alignItems: 'flex-start', justifyContent: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  col: { flexDirection: 'column' },
});
