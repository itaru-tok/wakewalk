import { useCallback, useState } from 'react'
import { getDailyOutcomeMap } from '../storage/dailyOutcome'
import { getDateKey } from '../utils/time'

export interface MonthData {
  year: number
  month: number
  weeks: (DayData | null)[][]
}

export type DayStatus = 'success' | 'fail' | 'future' | 'empty'

export interface DayData {
  date: Date
  status: DayStatus
}

export const useCalendarData = () => {
  const [monthsData, setMonthsData] = useState<MonthData[]>([])

  const buildCalendar = useCallback(async () => {
    const outcomes = await getDailyOutcomeMap()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const monthsArray: MonthData[] = []

    for (let m = 0; m < 12; m++) {
      const monthDate = new Date()
      monthDate.setMonth(monthDate.getMonth() - (11 - m))

      const year = monthDate.getFullYear()
      const month = monthDate.getMonth()

      const weeks: (DayData | null)[][] = []

      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const totalDays = lastDay.getDate()

      const allDays: (DayData | null)[] = []
      const firstDayOfWeek = firstDay.getDay()
      for (let i = 0; i < firstDayOfWeek; i++) {
        allDays.push(null)
      }

      for (let day = 1; day <= totalDays; day++) {
        const date = new Date(year, month, day)
        date.setHours(0, 0, 0, 0)
        const dateKey = getDateKey(date)
        const record = outcomes[dateKey]

        let status: DayStatus = 'empty'
        if (date.getTime() > today.getTime()) {
          status = 'future'
        } else if (record) {
          if (record.mode === 'nap') {
            status = 'empty'
          } else if (record.outcome === 'success') {
            status = 'success'
          } else if (record.outcome === 'fail') {
            status = 'fail'
          } else {
            status = 'empty'
          }
        }

        allDays.push({ date, status })
      }

      while (allDays.length % 7 !== 0) {
        allDays.push(null)
      }

      for (let i = 0; i < allDays.length; i += 7) {
        weeks.push(allDays.slice(i, i + 7))
      }

      monthsArray.push({ year, month, weeks })
    }

    setMonthsData(monthsArray)
  }, [])

  return {
    monthsData,
    buildCalendar,
  }
}
