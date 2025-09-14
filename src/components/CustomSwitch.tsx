import { useEffect, useRef } from 'react'
import { Animated, TouchableOpacity, type ViewStyle } from 'react-native'
import { colors } from '../constants/theme'

type CustomSwitchProps = {
  value: boolean
  onValueChange: (value: boolean) => void
  style?: ViewStyle
}

const SWITCH_WIDTH = 50
const SWITCH_HEIGHT = 28
const THUMB_SIZE = 20
const BORDER_WIDTH = 3
const ANIMATION_DURATION = 200
const TRACK_PADDING = { on: 4, off: 2 }
const THUMB_TRAVEL_DISTANCE = 22

export default function CustomSwitch({
  value,
  onValueChange,
  style,
}: CustomSwitchProps) {
  const translateX = useRef(
    new Animated.Value(value ? THUMB_TRAVEL_DISTANCE : 0),
  ).current

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: value ? THUMB_TRAVEL_DISTANCE : 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start()
  }, [value])

  const handlePress = () => {
    onValueChange(!value)
  }

  const switchStyles = {
    width: SWITCH_WIDTH,
    height: SWITCH_HEIGHT,
    borderRadius: SWITCH_HEIGHT / 2,
    backgroundColor: value ? colors.primary : colors.accent,
    borderWidth: value ? 0 : BORDER_WIDTH,
    borderColor: colors.primary,
    padding: value ? TRACK_PADDING.on : TRACK_PADDING.off,
  } as const

  const thumbStyles = {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: value ? colors.accent : colors.primary,
    transform: [{ translateX }],
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      className={`rounded-full border-primary ${value ? 'bg-primary border-0' : 'bg-accent border-[3px]'} justify-center`}
      style={[switchStyles, style]}
    >
      <Animated.View style={thumbStyles} />
    </TouchableOpacity>
  )
}
