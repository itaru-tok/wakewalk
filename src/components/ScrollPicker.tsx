import { GlassView } from 'expo-glass-effect'
import { Dimensions, ScrollView, Text, View } from 'react-native'

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
  const itemHeight = 60
  const visibleItems = 5
  const containerHeight = itemHeight * visibleItems

  return (
    <View style={{ height: containerHeight, justifyContent: 'center' }}>
      <GlassView
        style={{
          position: 'absolute',
          top: itemHeight * 2,
          left: 0,
          right: 0,
          height: itemHeight,
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 12,
          zIndex: 1,
        }}
        glassEffectStyle="clear"
      />

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
            key={index}
            style={{
              height: itemHeight,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: index === selectedIndex ? 32 : 24,
                fontWeight: index === selectedIndex ? 'bold' : 'normal',
                color:
                  index === selectedIndex ? '#ffffff' : 'rgba(255,255,255,0.6)',
                fontFamily: 'Comfortaa',
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
