import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'

interface UseAsyncStorageStateOptions<T> {
  key: string
  defaultValue: T
  validate?: (value: unknown) => value is T
}

/**
 * Hook to manage state with AsyncStorage persistence and hydration
 */
export function useAsyncStorageState<T>({
  key,
  defaultValue,
  validate,
}: UseAsyncStorageStateOptions<T>) {
  const [state, setState] = useState<T>(defaultValue)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from AsyncStorage on mount
  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const raw = await AsyncStorage.getItem(key)
        if (raw && isMounted) {
          const parsed = JSON.parse(raw) as T
          if (!validate || validate(parsed)) {
            setState(parsed)
          }
        }
      } catch (error) {
        console.warn(`Failed to load ${key}`, error)
      } finally {
        if (isMounted) {
          setIsHydrated(true)
        }
      }
    })()
    return () => {
      isMounted = false
    }
  }, [key, validate])

  // Save to AsyncStorage when state changes (after hydration)
  useEffect(() => {
    if (!isHydrated) return
    ;(async () => {
      try {
        await AsyncStorage.setItem(key, JSON.stringify(state))
      } catch (error) {
        console.warn(`Failed to save ${key}`, error)
      }
    })()
  }, [key, state, isHydrated])

  return { state, setState, isHydrated }
}
