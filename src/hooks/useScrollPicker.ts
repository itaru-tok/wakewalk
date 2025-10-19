import * as Haptics from 'expo-haptics'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { ScrollView } from 'react-native'

const REPEAT_MULTIPLIER = 100

interface ScrollPickerOptions {
  items: string[]
  selectedIndex: number
  onValueChange: (index: number) => void
  cyclic: boolean
  itemHeight: number
}

export function useScrollPicker({
  items,
  selectedIndex,
  onValueChange,
  cyclic,
  itemHeight,
}: ScrollPickerOptions) {
  const scrollRef = useRef<ScrollView | null>(null)
  const hasInitializedRef = useRef(false)
  const suppressMomentumRef = useRef(false)
  const lastRequestedIndexRef = useRef<number | null>(null)
  const initialOffsetRef = useRef<number | null>(null)
  const previousScrollIndexRef = useRef<number | null>(null)

  const itemsLength = items.length

  const normalizeIndex = useCallback(
    (index: number) => {
      if (itemsLength === 0) return 0
      if (!cyclic) {
        if (index < 0) return 0
        if (index >= itemsLength) return itemsLength - 1
        return index
      }
      const modulo = index % itemsLength
      return modulo < 0 ? modulo + itemsLength : modulo
    },
    [cyclic, itemsLength],
  )

  const selectedNormalizedIndex = useMemo(
    () => normalizeIndex(selectedIndex),
    [normalizeIndex, selectedIndex],
  )

  const data = useMemo(() => {
    if (itemsLength === 0) return [] as string[]
    if (!cyclic) return items

    // Create repeated array efficiently
    const total = itemsLength * REPEAT_MULTIPLIER
    const repeated: string[] = new Array(total)
    // Optimize by copying chunks instead of individual items
    for (let chunk = 0; chunk < REPEAT_MULTIPLIER; chunk += 1) {
      const offset = chunk * itemsLength
      for (let i = 0; i < itemsLength; i += 1) {
        repeated[offset + i] = items[i]
      }
    }
    return repeated
  }, [cyclic, items, itemsLength])

  const targetIndex = useMemo(() => {
    if (itemsLength === 0) return 0
    if (!cyclic) return selectedNormalizedIndex

    const cycleStart = Math.floor(REPEAT_MULTIPLIER / 2) * itemsLength
    return cycleStart + selectedNormalizedIndex
  }, [cyclic, itemsLength, selectedNormalizedIndex])

  const currentTargetOffset = useMemo(
    () => targetIndex * itemHeight,
    [targetIndex, itemHeight],
  )

  if (initialOffsetRef.current === null) {
    initialOffsetRef.current = currentTargetOffset
  }

  useEffect(() => {
    if (!scrollRef.current || itemsLength === 0) return
    if (
      lastRequestedIndexRef.current === targetIndex &&
      hasInitializedRef.current
    )
      return

    lastRequestedIndexRef.current = targetIndex

    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true
      scrollRef.current.scrollTo({ y: currentTargetOffset, animated: false })
      return
    }

    suppressMomentumRef.current = true
    scrollRef.current.scrollTo({ y: currentTargetOffset, animated: true })
  }, [currentTargetOffset, itemsLength, targetIndex])

  const getIndexFromOffset = useCallback(
    (offsetY: number) => {
      const rawIndex = Math.round(offsetY / itemHeight)
      return normalizeIndex(rawIndex)
    },
    [itemHeight, normalizeIndex],
  )

  // Handle scroll for haptic feedback only
  const handleScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      if (itemsLength === 0) return

      const normalized = getIndexFromOffset(event.nativeEvent.contentOffset.y)

      // Trigger haptic feedback when index changes
      if (normalized !== previousScrollIndexRef.current) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
        previousScrollIndexRef.current = normalized
      }
    },
    [itemsLength, getIndexFromOffset],
  )

  const handleMomentumScrollEnd = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      if (itemsLength === 0) return

      if (suppressMomentumRef.current) {
        suppressMomentumRef.current = false
        return
      }

      const normalizedIndex = getIndexFromOffset(
        event.nativeEvent.contentOffset.y,
      )

      if (normalizedIndex !== selectedNormalizedIndex) {
        onValueChange(normalizedIndex)
      }
    },
    [itemsLength, getIndexFromOffset, onValueChange, selectedNormalizedIndex],
  )

  return {
    data,
    handleScroll,
    handleMomentumScrollEnd,
    scrollRef,
    normalizeIndex,
    selectedNormalizedIndex,
    initialScrollOffset: initialOffsetRef.current ?? 0,
  }
}
