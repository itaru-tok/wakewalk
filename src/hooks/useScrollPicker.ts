import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { ScrollView } from 'react-native'

const REPEAT_MULTIPLIER = 100

export function useScrollPicker(
  items: string[],
  selectedIndex: number,
  cyclic: boolean,
  itemHeight: number,
) {
  const scrollRef = useRef<ScrollView | null>(null)
  const hasInitialScrollRef = useRef(false)
  const initialOffsetRef = useRef<number | null>(null)

  const data = useMemo(() => {
    if (!cyclic) return items
    const repeated: string[] = []
    for (let i = 0; i < REPEAT_MULTIPLIER; i += 1) {
      repeated.push(...items)
    }
    return repeated
  }, [cyclic, items])

  const normalizeIndex = useCallback(
    (index: number) => {
      const length = items.length
      if (length === 0) return 0
      if (!cyclic) {
        if (index < 0) return 0
        if (index >= length) return length - 1
        return index
      }
      const modulo = index % length
      return modulo < 0 ? modulo + length : modulo
    },
    [cyclic, items.length],
  )

  const getCenterIndexForSelected = useCallback(() => {
    if (!cyclic) return normalizeIndex(selectedIndex)
    const midpoint = Math.floor((REPEAT_MULTIPLIER * items.length) / 2)
    return midpoint + normalizeIndex(selectedIndex)
  }, [cyclic, items.length, normalizeIndex, selectedIndex])

  if (initialOffsetRef.current === null) {
    const centerIndex = getCenterIndexForSelected()
    initialOffsetRef.current = centerIndex * itemHeight
  }

  const scrollToIndex = useCallback(
    (index: number, animated: boolean) => {
      if (!scrollRef.current) return
      scrollRef.current.scrollTo({ y: index * itemHeight, animated })
    },
    [itemHeight],
  )

  useEffect(() => {
    if (!scrollRef.current || items.length === 0) return
    const targetIndex = getCenterIndexForSelected()
    if (!hasInitialScrollRef.current) {
      hasInitialScrollRef.current = true
      scrollToIndex(targetIndex, false)
      return
    }
    scrollToIndex(targetIndex, true)
  }, [getCenterIndexForSelected, items.length, scrollToIndex])

  return {
    scrollRef,
    data,
    normalizeIndex,
    initialScrollOffset: initialOffsetRef.current ?? 0,
  }
}

