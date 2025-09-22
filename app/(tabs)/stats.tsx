import { LinearGradient } from 'expo-linear-gradient'
import { useCallback, useMemo, useRef, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect } from 'expo-router'
import { fonts, theme } from '../../src/constants/theme'
import { useTheme } from '../../src/context/ThemeContext'
import { getDailyOutcomeMap } from '../../src/storage/dailyOutcome'
import { getDarkerShade } from '../../src/utils/color'
import { getDateKey } from '../../src/utils/time'

const CELL_SIZE = 14
const CELL_MARGIN = 3

interface MonthData {
  year: number
  month: number
  weeks: (DayData | null)[][]
}

type DayStatus = 'success' | 'fail' | 'future' | 'empty'

interface DayData {
  date: Date
  status: DayStatus
}

export default function HybridLiquidGlassStatsScreen() {
  const { themeMode, themeColor, gradientColors } = useTheme()
  const insets = useSafeAreaInsets()
  const TAB_BAR_HEIGHT = 90
  const bottomPadding = insets.bottom + TAB_BAR_HEIGHT + 12
  const [monthsData, setMonthsData] = useState<MonthData[]>([])
  const scrollViewRef = useRef<ScrollView>(null)
  const shouldScrollToEndRef = useRef(false)

  const getBackgroundColors = useCallback(() => {
    if (themeMode === 'color') {
      return [themeColor, getDarkerShade(themeColor), '#000000'] as const
    }
    return [...gradientColors, '#000000'] as unknown as [
      string,
      string,
      ...string[],
    ]
  }, [themeMode, themeColor, gradientColors])

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
    shouldScrollToEndRef.current = true
  }, [])

  useFocusEffect(
    useCallback(() => {
      buildCalendar()
    }, [buildCalendar]),
  )

  const getMonthName = (month: number) => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]
    return months[month]
  }

  const getDayColor = (status: DayStatus) => {
    switch (status) {
      case 'success':
        return theme.contribution.colors.perfect
      case 'fail':
        return theme.contribution.colors.missed
      case 'future':
      case 'empty':
      default:
        return theme.contribution.colors.empty
    }
  }

  const getDayLabels = () => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <LinearGradient
      colors={getBackgroundColors()}
      style={{ flex: 1, paddingBottom: bottomPadding }}
      locations={themeMode === 'color' ? [0, 0.5, 1] : undefined}
    >
      <SafeAreaView style={{ flex: 1, padding: 30 }} edges={['top', 'bottom']}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ marginRight: 10, marginTop: 30, paddingRight: 5 }}>
            {getDayLabels()
              .filter((_, i) => i % 2 === 1)
              .map((label, index) => (
                <View
                  key={`day-label-${label}`}
                  style={{
                    height: (CELL_SIZE + CELL_MARGIN) * 2,
                    justifyContent: 'center',
                    marginTop: index === 0 ? 0 : -CELL_MARGIN,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.7)',
                      fontFamily: fonts.comfortaa.medium,
                    }}
                  >
                    {label}
                  </Text>
                </View>
              ))}
          </View>

          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
            style={{ flex: 1 }}
            onContentSizeChange={() => {
              if (!shouldScrollToEndRef.current) return
              shouldScrollToEndRef.current = false
              scrollViewRef.current?.scrollToEnd({ animated: false })
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              {monthsData.map((monthData) => (
                <View
                  key={`${monthData.year}-${monthData.month}`}
                  style={{ marginRight: CELL_MARGIN }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.7)',
                      marginBottom: 8,
                      fontFamily: fonts.comfortaa.medium,
                    }}
                  >
                    {getMonthName(monthData.month)}
                  </Text>

                  <View style={{ flexDirection: 'row' }}>
                    {monthData.weeks.map((week, weekIndex) => (
                      <View
                        key={`${monthData.year}-${monthData.month}-week-${weekIndex}`}
                        style={{
                          marginRight:
                            weekIndex < monthData.weeks.length - 1
                              ? CELL_MARGIN
                              : 0,
                        }}
                      >
                        {week.map((day, dayIndex) => (
                          <View
                            key={
                              day
                                ? `${day.date.toISOString()}`
                                : `empty-${monthData.year}-${monthData.month}-${weekIndex}-${dayIndex}`
                            }
                            style={{
                              width: CELL_SIZE,
                              height: CELL_SIZE,
                              backgroundColor: day
                                ? getDayColor(day.status)
                                : theme.contribution.colors.empty,
                              borderRadius: 2,
                              marginBottom: dayIndex < 6 ? CELL_MARGIN : 0,
                            }}
                          />
                        ))}
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
            <View
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: theme.contribution.colors.perfect,
                borderRadius: 2,
                marginRight: 6,
              }}
            />
            <Text
              style={{ color: 'rgba(255,255,255,0.7)', fontFamily: fonts.comfortaa.medium }}
            >
              Success
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: theme.contribution.colors.missed,
                borderRadius: 2,
                marginRight: 6,
              }}
            />
            <Text
              style={{ color: 'rgba(255,255,255,0.7)', fontFamily: fonts.comfortaa.medium }}
            >
              Missed
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}
