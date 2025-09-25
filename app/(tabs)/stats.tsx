import { LinearGradient } from 'expo-linear-gradient'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { BannerAdSize } from 'react-native-google-mobile-ads'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import MyAdmob from '../../src/components/MyAdmob'
import { fonts, theme } from '../../src/constants/theme'
import { usePremium } from '../../src/context/PremiumContext'
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
  const { isPremium } = usePremium()
  const insets = useSafeAreaInsets()
  const TAB_BAR_HEIGHT = 90
  const bottomPadding = insets.bottom + TAB_BAR_HEIGHT + 12
  const [monthsData, setMonthsData] = useState<MonthData[]>([])

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
      <SafeAreaView
        style={{ flex: 1, paddingHorizontal: 25 }}
        edges={['top', 'bottom']}
      >
        {/* Header */}
        <View className="mb-6 pt-4">
          <Text
            className="text-accent text-2xl"
            style={{ fontFamily: fonts.comfortaa.bold }}
          >
            Stats
          </Text>
        </View>

        <View className="bg-white/10 rounded-2xl p-4">
          <View className="flex-row">
            <View className="mr-2.5 mt-7 pr-1">
              {getDayLabels()
                .filter((_, i) => i % 2 === 1)
                .map((label, index) => (
                  <View
                    key={`day-label-${label}`}
                    className="justify-center"
                    style={{
                      height: (CELL_SIZE + CELL_MARGIN) * 2,
                      marginTop: index === 0 ? 0 : -CELL_MARGIN,
                    }}
                  >
                    <Text
                      className="text-xs text-white/70"
                      style={{ fontFamily: fonts.comfortaa.medium }}
                    >
                      {label}
                    </Text>
                  </View>
                ))}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
              style={{ flex: 1, transform: [{ scaleX: -1 }] }}
            >
              <View
                style={{ flexDirection: 'row', transform: [{ scaleX: -1 }] }}
              >
                {monthsData.map((monthData) => (
                  <View
                    key={`${monthData.year}-${monthData.month}`}
                    style={{ marginRight: CELL_MARGIN }}
                  >
                    <Text
                      className="text-sm text-white/70 mb-2"
                      style={{ fontFamily: fonts.comfortaa.medium }}
                    >
                      {getMonthName(monthData.month)}
                    </Text>

                    <View className="flex-row">
                      {monthData.weeks.slice(0, 5).map((week, weekIndex) => (
                        <View
                          key={`${monthData.year}-${monthData.month}-week-${weekIndex}`}
                          style={{
                            marginRight: weekIndex < 4 ? CELL_MARGIN : 0,
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

          <View className="flex-row items-center mt-4">
            <View className="flex-row items-center mr-4">
              <View
                className="rounded-sm mr-1.5"
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  backgroundColor: theme.contribution.colors.missed,
                }}
              />
              <Text
                className="text-white/70"
                style={{ fontFamily: fonts.comfortaa.medium }}
              >
                Missed
              </Text>
            </View>
            <View className="flex-row items-center">
              <View
                className="rounded-sm mr-1.5"
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  backgroundColor: theme.contribution.colors.perfect,
                }}
              />
              <Text
                className="text-white/70"
                style={{ fontFamily: fonts.comfortaa.medium }}
              >
                Success
              </Text>
            </View>
          </View>

          {/* How commits work explanation */}
          <Text
            className="text-white/50 text-xs mt-3 text-left leading-tight"
            style={{ fontFamily: fonts.comfortaa.medium }}
          >
            Commits are earned by walking 100+ steps within 60 minutes of set
            alarm time after stopping your alarm.
          </Text>
        </View>
        {/* Ad Banner - Premium users don't see ads */}
        {!isPremium && (
          <View className="mt-6">
            <MyAdmob size={BannerAdSize.BANNER} />
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  )
}
