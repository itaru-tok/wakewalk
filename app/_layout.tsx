import {
  Comfortaa_500Medium,
  Comfortaa_700Bold,
  useFonts,
} from '@expo-google-fonts/comfortaa'
import { SplashScreen, Stack } from 'expo-router'
import { useEffect } from 'react'
import { View } from 'react-native'

SplashScreen.preventAutoHideAsync().catch(() => {
  // ignore errors if splash screen was already hidden
})

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Comfortaa_500Medium,
    Comfortaa_700Bold,
  })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {
        // no-op; splash screen will hide automatically on error
      })
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#000' }} />
  }

  return <Stack screenOptions={{ headerShown: false }} />
}
