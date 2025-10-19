import { memo, useMemo } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { fonts } from '../constants/theme'
import { useScrollPicker } from '../hooks/useScrollPicker'

interface ScrollPickerProps {
  items: string[]
  selectedIndex: number
  onValueChange: (index: number) => void
  onScrollStart?: () => void
  onScrollEnd?: () => void
  cyclic?: boolean
  rowHeight?: number
  visibleCount?: number
}

// Memoized item component for better performance
const PickerItem = memo<{
  label: string
  isSelected: boolean
  itemHeight: number
}>(({ label, isSelected, itemHeight }) => (
  <View
    style={{
      height: itemHeight,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Text
      style={{
        fontSize: 36,
        color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.6)',
        fontFamily: isSelected ? fonts.comfortaa.bold : fonts.comfortaa.medium,
      }}
    >
      {label}
    </Text>
  </View>
))

PickerItem.displayName = 'PickerItem'

function ScrollPicker({
  items,
  selectedIndex,
  onValueChange,
  onScrollStart,
  onScrollEnd,
  cyclic = true,
  rowHeight = 80,
  visibleCount = 3,
}: ScrollPickerProps) {
  const containerHeight = useMemo(
    () => rowHeight * visibleCount,
    [rowHeight, visibleCount],
  )

  const {
    data,
    handleScroll,
    handleMomentumScrollEnd,
    scrollRef,
    normalizeIndex,
    selectedNormalizedIndex,
    initialScrollOffset,
  } = useScrollPicker({
    items,
    selectedIndex,
    onValueChange,
    cyclic,
    itemHeight: rowHeight,
  })

  const initialContentOffset = useMemo(
    () => ({ x: 0, y: initialScrollOffset }),
    [initialScrollOffset],
  )

  const contentContainerStyle = useMemo(
    () => ({
      paddingVertical: rowHeight * ((visibleCount - 1) / 2),
    }),
    [rowHeight, visibleCount],
  )

  const itemsLength = items.length
  const pickerItems = useMemo(
    () =>
      data.map((label, dataIndex) => {
        const normalizedIndex = normalizeIndex(dataIndex)
        const cycleIndex = cyclic ? Math.floor(dataIndex / itemsLength) : 0

        return {
          key: `${normalizedIndex}-${cycleIndex}-${label}`,
          normalizedIndex,
          label,
        }
      }),
    [data, normalizeIndex, cyclic, itemsLength],
  )

  const containerStyle = useMemo(
    () => ({ height: containerHeight, justifyContent: 'center' as const }),
    [containerHeight],
  )

  return (
    <View style={containerStyle}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={rowHeight}
        decelerationRate="fast"
        contentOffset={initialContentOffset}
        contentContainerStyle={contentContainerStyle}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={onScrollStart}
        onMomentumScrollEnd={(e) => {
          handleMomentumScrollEnd(e)
          onScrollEnd?.()
        }}
      >
        {pickerItems.map(({ key, label, normalizedIndex }) => (
          <PickerItem
            key={key}
            label={label}
            isSelected={normalizedIndex === selectedNormalizedIndex}
            itemHeight={rowHeight}
          />
        ))}
      </ScrollView>
    </View>
  )
}

export default memo(ScrollPicker)
