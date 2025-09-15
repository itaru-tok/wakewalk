import { ScrollView, Text, View } from 'react-native'

interface ScrollPickerProps {
  items: string[]
  selectedIndex: number
  onValueChange: (index: number) => void
}

export default function LiquidGlassScrollPicker({
  items,
  selectedIndex,
  onValueChange,
}: ScrollPickerProps) {
  const itemHeight = 50
  const visibleItems = 5
  const containerHeight = itemHeight * visibleItems

  return (
    <View style={{ height: containerHeight, justifyContent: 'center' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingVertical: itemHeight * 2,
        }}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.y / itemHeight,
          )
          onValueChange(index)
        }}
      >
        {items.map((item, index) => (
          <View
            key={`scroll-item-${item}`}
            style={{
              height: itemHeight,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: index === selectedIndex ? 50 : 24,
                color:
                  index === selectedIndex ? '#ffffff' : 'rgba(255,255,255,0.6)',
                fontFamily:
                  index === selectedIndex
                    ? 'Comfortaa_700Bold'
                    : 'Comfortaa_500Medium',
              }}
            >
              {item}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}
