import { useCallback, useState } from 'react'
import { getDailyOutcomeMap } from '../storage/dailyOutcome'

export interface StreakData {
  currentStreak: number
  currentStreakStart: Date | null
  currentStreakEnd: Date | null
  longestStreak: number
  longestStreakStart: Date | null
  longestStreakEnd: Date | null
}

export const useStreaks = () => {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    currentStreakStart: null,
    currentStreakEnd: null,
    longestStreak: 0,
    longestStreakStart: null,
    longestStreakEnd: null,
  })

  const calculateStreaks = useCallback(
    (outcomes: Record<string, { mode?: string; outcome?: string }>) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const sortedDates = Object.keys(outcomes)
        .filter((dateKey) => {
          const record = outcomes[dateKey]
          return record && record.mode !== 'nap' && record.outcome === 'success'
        })
        .sort()

      if (sortedDates.length === 0) {
        return {
          currentStreak: 0,
          currentStreakStart: null,
          currentStreakEnd: null,
          longestStreak: 0,
          longestStreakStart: null,
          longestStreakEnd: null,
        }
      }

      // Current Streak計算 - 今日を含む最新の連続した成功日数
      let currentStreak = 0
      let currentStreakStart = null
      let currentStreakEnd = null

      // 今日の日付のキーを作成
      const todayKey =
        today.getFullYear() +
        '-' +
        String(today.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(today.getDate()).padStart(2, '0')

      // 今日が成功しているかチェック
      const todayRecord = outcomes[todayKey]
      const todayIsSuccess =
        todayRecord &&
        todayRecord.mode !== 'nap' &&
        todayRecord.outcome === 'success'

      if (todayIsSuccess) {
        // 今日が成功している場合、そこから過去に遡って連続した成功日数をカウント
        currentStreak = 1
        currentStreakEnd = new Date(today)
        currentStreakStart = new Date(today)

        // 過去に遡って連続した成功日数をカウント
        for (let i = sortedDates.length - 1; i >= 0; i--) {
          const dateKey = sortedDates[i]
          const [year, month, day] = dateKey.split('-').map(Number)
          const date = new Date(year, month - 1, day)

          // 今日より前の日付のみチェック
          if (date >= today) continue

          const record = outcomes[dateKey]
          if (record && record.mode !== 'nap' && record.outcome === 'success') {
            // 前の日付との差をチェック（1日違いであることを確認）
            const dayDiff = Math.floor(
              (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
            )
            if (dayDiff === currentStreak) {
              currentStreak++
              currentStreakStart = date
            } else {
              break
            }
          } else {
            break
          }
        }
      }

      // Longest Streak計算
      let longestStreak = 0
      let longestStreakStart = null
      let longestStreakEnd = null
      let tempStreak = 1

      // 最初の成功日付をパース
      const [firstYear, firstMonth, firstDay] = sortedDates[0]
        .split('-')
        .map(Number)
      let tempStart = new Date(firstYear, firstMonth - 1, firstDay)

      for (let i = 1; i < sortedDates.length; i++) {
        // 前の日付をパース
        const [prevYear, prevMonth, prevDay] = sortedDates[i - 1]
          .split('-')
          .map(Number)
        const prevDate = new Date(prevYear, prevMonth - 1, prevDay)

        // 現在の日付をパース
        const [currYear, currMonth, currDay] = sortedDates[i]
          .split('-')
          .map(Number)
        const currentDate = new Date(currYear, currMonth - 1, currDay)

        // 日付の差が1日ならstreak継続
        const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 1) {
          tempStreak++
        } else {
          // Streakが終了したら最長かどうかチェック
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak
            longestStreakStart = new Date(tempStart)
            longestStreakEnd = new Date(prevDate)
          }
          tempStreak = 1
          tempStart = new Date(currentDate)
        }
      }

      // 最後のstreakをチェック
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak
        longestStreakStart = new Date(tempStart)
        // 最後の日付をパース
        const [lastYear, lastMonth, lastDay] = sortedDates[
          sortedDates.length - 1
        ]
          .split('-')
          .map(Number)
        longestStreakEnd = new Date(lastYear, lastMonth - 1, lastDay)
      }

      return {
        currentStreak,
        currentStreakStart,
        currentStreakEnd,
        longestStreak,
        longestStreakStart,
        longestStreakEnd,
      }
    },
    [],
  )

  const updateStreaks = useCallback(async () => {
    const outcomes = await getDailyOutcomeMap()
    const newStreakData = calculateStreaks(outcomes)
    setStreakData(newStreakData)
  }, [calculateStreaks])

  return {
    streakData,
    updateStreaks,
    calculateStreaks,
  }
}
