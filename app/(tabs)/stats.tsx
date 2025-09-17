import { LinearGradient } from 'expo-linear-gradient'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { fonts, theme } from '../../src/constants/theme'
import { useTheme } from '../../src/context/ThemeContext'
import { getDarkerShade } from '../../src/utils/color'

const CELL_SIZE = 14
const CELL_MARGIN = 3

interface MonthData {
  year: number
  month: number
  weeks: (DayData | null)[][]
}

interface DayData {
  date: Date
  status: 'perfect' | 'good' | 'missed' | 'future'
  steps: number
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
    } else {
      return [...gradientColors, '#000000'] as unknown as [
        string,
        string,
        ...string[],
      ]
    }
  }, [themeMode, themeColor, gradientColors])

  // PlatformColor is not implemented on Web (react-native-web), so fall back

  const loadHealthData = useCallback(async () => {
    // Request permissions first
    // await requestHealthKitPermissions();

    const monthsArray: MonthData[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let m = 0; m < 12; m++) {
      const monthDate = new Date()
      monthDate.setMonth(monthDate.getMonth() - (11 - m))

      const year = monthDate.getFullYear()
      const month = monthDate.getMonth()

      const weeks: (DayData | null)[][] = []

      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const totalDays = lastDay.getDate()

      // Create all days for the month
      const allDays: (DayData | null)[] = []

      // Add padding for the first week
      const firstDayOfWeek = firstDay.getDay()
      for (let i = 0; i < firstDayOfWeek; i++) {
        allDays.push(null)
      }

      // Add all days of the month
      for (let day = 1; day <= totalDays; day++) {
        const date = new Date(year, month, day)
        date.setHours(0, 0, 0, 0)

        let status: 'perfect' | 'good' | 'missed' | 'future' = 'future'
        const steps = 0

        if (date.getTime() <= today.getTime()) {
          // Simulated data for now
          const random = Math.random()
          if (random > 0.7) {
            status = 'perfect'
          } else if (random > 0.3) {
            status = 'good'
          } else {
            status = 'missed'
          }
        }

        allDays.push({ date, status, steps })
      }

      // Add padding for the last week
      while (allDays.length % 7 !== 0) {
        allDays.push(null)
      }

      // Split into weeks
      for (let i = 0; i < allDays.length; i += 7) {
        weeks.push(allDays.slice(i, i + 7))
      }

      monthsArray.push({ year, month, weeks })
    }

    setMonthsData(monthsArray)
    shouldScrollToEndRef.current = true
  }, [])

  useEffect(() => {
    loadHealthData()
  }, [loadHealthData])

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

  const getDayColor = (status: string) => {
    switch (status) {
      case 'perfect':
        return theme.contribution.colors.perfect
      case 'good':
        return theme.contribution.colors.good
      case 'missed':
        return theme.contribution.colors.missed
      case 'future':
        return theme.contribution.colors.empty
      default:
        return theme.contribution.colors.empty
    }
  }

  const getDayLabels = () => {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  }

  return (
    <LinearGradient
      colors={getBackgroundColors()}
      style={{ flex: 1, paddingBottom: bottomPadding }}
      locations={themeMode === 'color' ? [0, 0.5, 1] : undefined}
    >
      <SafeAreaView style={{ flex: 1, padding: 30 }} edges={['top', 'bottom']}>
        {/* Header with Glass Effect */}
        {/* Main Content with Glass Background */}
        <View style={{ flexDirection: 'row' }}>
          {/* Fixed week labels */}
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

          {/* Scrollable months */}
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
              {monthsData.map((monthData, _monthIndex) => (
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

        {/* Legend with Glass Effect */}
        <Text
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.7)',
            marginRight: 20,
            fontFamily: fonts.comfortaa.medium,
          }}
        >
          Less
        </Text>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <View
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: theme.contribution.colors.empty,
              borderRadius: 2,
            }}
          />
          <View
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: theme.contribution.colors.good,
              borderRadius: 2,
            }}
          />
          <View
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: theme.contribution.colors.perfect,
              borderRadius: 2,
            }}
          />
        </View>
        <Text
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.7)',
            marginLeft: 20,
            fontFamily: fonts.comfortaa.medium,
          }}
        >
          More
        </Text>
      </SafeAreaView>
    </LinearGradient>
  )
}
