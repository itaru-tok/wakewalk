import React, { useRef, useState, useEffect } from 'react';
import { View, Text, ScrollView, NativeSyntheticEvent, NativeScrollEvent, Animated } from 'react-native';

interface ScrollPickerProps {
  items: string[];
  selectedIndex: number;
  onValueChange: (index: number) => void;
  itemHeight?: number;
  visibleItems?: number;
}

const DEFAULT_CONFIG = {
  itemHeight: 60,
  visibleItems: 5,
  animationDuration: 300,
  scrollThrottle: 16,
  opacity: {
    inputRange: [-2, -1, 0, 1, 2],
    outputRange: [0.3, 0.5, 1, 0.5, 0.3],
  },
  scale: {
    inputRange: [-2, -1, 0, 1, 2],
    outputRange: [0.8, 0.9, 1.1, 0.9, 0.8],
  },
};

export default function ScrollPicker({
  items,
  selectedIndex,
  onValueChange,
  itemHeight = DEFAULT_CONFIG.itemHeight,
  visibleItems = DEFAULT_CONFIG.visibleItems,
}: ScrollPickerProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollY] = useState(new Animated.Value(0));
  
  const containerHeight = itemHeight * visibleItems;
  const contentOffset = (visibleItems - 1) / 2 * itemHeight;

  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: selectedIndex * itemHeight,
          animated: false,
        });
      }, 0);
    }
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    if (index !== selectedIndex && index >= 0 && index < items.length) {
      onValueChange(index);
    }
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    scrollViewRef.current?.scrollTo({
      y: index * itemHeight,
      animated: true,
    });
  };

  const createInputRange = (index: number) => {
    return Array.from({ length: 5 }, (_, i) => (index - 2 + i) * itemHeight);
  };

  const createAnimatedStyle = (index: number) => {
    const inputRange = createInputRange(index);
    
    return {
      opacity: scrollY.interpolate({
        inputRange,
        outputRange: DEFAULT_CONFIG.opacity.outputRange,
        extrapolate: 'clamp',
      }),
      scale: scrollY.interpolate({
        inputRange,
        outputRange: DEFAULT_CONFIG.scale.outputRange,
        extrapolate: 'clamp',
      }),
    };
  };

  const renderItem = (item: string, index: number) => {
    const isSelected = index === selectedIndex;
    const { opacity, scale } = createAnimatedStyle(index);

    return (
      <Animated.View
        key={index}
        style={{
          height: itemHeight,
          justifyContent: 'center',
          alignItems: 'center',
          opacity,
          transform: [{ scale }],
        }}
      >
        <Text
          className={`text-center font-comfortaa font-medium ${
            isSelected ? 'text-time-active text-accent' : 'text-time-inactive text-secondary'
          }`}
        >
          {item}
        </Text>
      </Animated.View>
    );
  };

  return (
    <View style={{ height: containerHeight, overflow: 'hidden' }}>
      <Animated.ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { 
            useNativeDriver: false,
            listener: handleScroll,
          }
        )}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={DEFAULT_CONFIG.scrollThrottle}
        contentContainerStyle={{
          paddingTop: contentOffset,
          paddingBottom: contentOffset,
        }}
      >
        {items.map((item, index) => renderItem(item, index))}
      </Animated.ScrollView>
    </View>
  );
}
