import { LinearGradient } from 'expo-linear-gradient'
import { useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { BannerAdSize } from 'react-native-google-mobile-ads'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import MyAdmob from '../../src/components/MyAdmob'
import { fonts, theme } from '../../src/constants/theme'
import { useAlarmSettings } from '../../src/context/AlarmSettingsContext'
import { usePremium } from '../../src/context/PremiumContext'
import { useTheme } from '../../src/context/ThemeContext'
import {
  type DayStatus,
  useCalendarData,
} from '../../src/hooks/useCalendarData'
import { useStreaks } from '../../src/hooks/useStreaks'
import { getDarkerShade } from '../../src/utils/color'

const CELL_SIZE = 14
const CELL_MARGIN = 3
const MONTH_LABELS = [
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
] as const

type MonthLabel = (typeof MONTH_LABELS)[number]

export default function HybridLiquidGlassStatsScreen() {
  const { themeMode, themeColor, gradientColors } = useTheme()
  const { isPremium } = usePremium()
  const { streakData, updateStreaks } = useStreaks()
  const { walkGoalSteps, walkGoalMinutes } = useAlarmSettings()
  const insets = useSafeAreaInsets()
  const TAB_BAR_HEIGHT = 90
  const bottomPadding = insets.bottom + TAB_BAR_HEIGHT + 12
  const { monthsData, buildCalendar } = useCalendarData()

  const effectiveWalkGoalSteps = isPremium ? walkGoalSteps : 100
  const effectiveWalkGoalMinutes = isPremium ? walkGoalMinutes : 60

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

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        await updateStreaks()
        await buildCalendar()
      }

      loadData()
    }, [buildCalendar, updateStreaks]),
  )

  const getMonthName = (month: number): MonthLabel => MONTH_LABELS[month]

  const getDayColor = (status: DayStatus) => {
    switch (status) {
      case 'success':
        return theme.contribution.colors.perfect
      case 'fail':
        return theme.contribution.colors.missed
      default:
        return theme.contribution.colors.empty
    }
  }

  const getDayLabels = () => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const formatDateRange = (startDate: Date | null, endDate: Date | null) => {
    if (!startDate || !endDate) return ''

    const formatDate = (date: Date) => {
      return `${MONTH_LABELS[date.getMonth()]} ${date.getDate()}`
    }

    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

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
            <View className="mr-2 mt-8">
              {getDayLabels()
                .filter((_, i) => i % 2 === 1)
                .map((label, index) => (
                  <View
                    key={`day-label-${label}`}
                    className="justify-center"
                    style={{
                      height: (CELL_SIZE + CELL_MARGIN) * 2,
                      marginTop: index === 0 ? 0 : -CELL_MARGIN + 3,
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
                      className="text-sm text-white/70 mb-1"
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
            className="text-white/50 text-sm mt-3 text-left leading-tight"
            style={{ fontFamily: fonts.comfortaa.medium }}
          >
            Commits are earned by walking {effectiveWalkGoalSteps}+ steps within{' '}
            {effectiveWalkGoalMinutes} minutes of set alarm time after alarm
            stops.
          </Text>
        </View>

        {/* Streak Section */}
        <View className="bg-white/10 rounded-2xl p-6 mt-6">
          <Text
            className="text-white/90 text-lg mb-4"
            style={{ fontFamily: fonts.comfortaa.bold }}
          >
            Streaks
          </Text>

          <View className="flex-row justify-between">
            {/* Current Streak */}
            <View className="flex-1 items-center">
              <View className="items-center mb-2">
                <Text
                  className="text-white text-5xl font-bold"
                  style={{ fontFamily: fonts.comfortaa.bold }}
                >
                  {streakData.currentStreak}
                </Text>
                <Text
                  className="text-white/70 text-sm"
                  style={{ fontFamily: fonts.comfortaa.medium }}
                >
                  Current Streak
                </Text>
              </View>
              {streakData.currentStreakStart && streakData.currentStreakEnd && (
                <Text
                  className="text-white/50 text-xs text-center"
                  style={{ fontFamily: fonts.comfortaa.medium }}
                >
                  {formatDateRange(
                    streakData.currentStreakStart,
                    streakData.currentStreakEnd,
                  )}
                </Text>
              )}
            </View>

            {/* Longest Streak */}
            <View className="flex-1 items-center">
              <View className="items-center mb-2">
                <Text
                  className="text-white text-5xl font-bold"
                  style={{ fontFamily: fonts.comfortaa.bold }}
                >
                  {streakData.longestStreak}
                </Text>
                <Text
                  className="text-white/70 text-sm"
                  style={{ fontFamily: fonts.comfortaa.medium }}
                >
                  Longest Streak
                </Text>
              </View>
              {streakData.longestStreakStart && streakData.longestStreakEnd && (
                <Text
                  className="text-white/50 text-xs text-center"
                  style={{ fontFamily: fonts.comfortaa.medium }}
                >
                  {formatDateRange(
                    streakData.longestStreakStart,
                    streakData.longestStreakEnd,
                  )}
                </Text>
              )}
            </View>
          </View>
        </View>
        {/* Ad Banner - Premium users don't see ads */}
        {!isPremium && (
          <View className="mt-6">
            <MyAdmob size={BannerAdSize.LARGE_BANNER} />
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  )
}
