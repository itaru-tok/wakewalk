import {
  Comfortaa_500Medium,
  Comfortaa_700Bold,
  useFonts,
} from '@expo-google-fonts/comfortaa'
import { SplashScreen, Stack } from 'expo-router'
import { useEffect } from 'react'
import { View } from 'react-native'
import { AdsConsent, AdsConsentStatus } from 'react-native-google-mobile-ads'
import { AlarmSettingsProvider } from '../src/context/AlarmSettingsContext'
import { PremiumProvider } from '../src/context/PremiumContext'
import { ThemeProvider } from '../src/context/ThemeContext'
import { initializeRevenueCat } from '../src/utils/revenuecat'

SplashScreen.preventAutoHideAsync().catch(() => {
  // ignore errors if splash screen was already hidden
})

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Comfortaa_500Medium,
    Comfortaa_700Bold,
  })

  // request consent for personalized ads for GDPR compliance
  useEffect(() => {
    const requestConsent = async () => {
      const consentInfo = await AdsConsent.requestInfoUpdate()

      if (consentInfo.status === AdsConsentStatus.REQUIRED) {
        await AdsConsent.showForm()
      }
    }

    requestConsent().catch(console.error)
  }, [])

  // Initialize RevenueCat for in-app purchases
  useEffect(() => {
    const initRevenueCat = async () => {
      try {
        await initializeRevenueCat()
      } catch (error) {
        console.error('Error initializing RevenueCat:', error)
      }
    }

    initRevenueCat()
  }, [])

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

  return (
    <ThemeProvider>
      <AlarmSettingsProvider>
        <PremiumProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </PremiumProvider>
      </AlarmSettingsProvider>
    </ThemeProvider>
  )
}
