import { useMemo } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { fonts } from '../constants/theme'
import { useScrollPicker } from '../hooks/useScrollPicker'

interface ScrollPickerProps {
  items: string[]
  selectedIndex: number
  onValueChange: (index: number) => void
  cyclic?: boolean
  rowHeight?: number
  visibleCount?: number
}

export default function LiquidGlassScrollPicker({
  items,
  selectedIndex,
  onValueChange,
  cyclic = true,
  rowHeight = 80,
  visibleCount = 3,
}: ScrollPickerProps) {
  const itemHeight = rowHeight
  const containerHeight = useMemo(
    () => itemHeight * visibleCount,
    [itemHeight, visibleCount],
  )
  const {
    data,
    handleMomentumScrollEnd,
    scrollRef,
    getNormalizedIndex,
    selectedNormalizedIndex,
    initialScrollOffset,
  } = useScrollPicker({
    items,
    selectedIndex,
    onValueChange,
    cyclic,
    itemHeight,
  })

  const initialContentOffset = useMemo(
    () => ({ x: 0, y: initialScrollOffset }),
    [initialScrollOffset],
  )

  return (
    <View style={{ height: containerHeight, justifyContent: 'center' }}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        contentOffset={initialContentOffset}
        contentContainerStyle={{
          paddingVertical: itemHeight * ((visibleCount - 1) / 2),
        }}
        onMomentumScrollEnd={handleMomentumScrollEnd}
      >
        {data.map((item, index) => {
          const normalizedIndex = getNormalizedIndex(index)
          const isSelected = normalizedIndex === selectedNormalizedIndex

          return (
            <View
              key={`scroll-item-${index}`}
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
                  fontFamily: isSelected
                    ? fonts.comfortaa.bold
                    : fonts.comfortaa.medium,
                }}
              >
                {item}
              </Text>
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}
