import Constants from 'expo-constants'
import { Platform } from 'react-native'
import Purchases, { type CustomerInfo, LOG_LEVEL } from 'react-native-purchases'
import RevenueCatUI from 'react-native-purchases-ui'

const getAPIKey = () => {
  return Constants.expoConfig?.extra?.revenueCatApiKey
}

const API_KEY = {
  ios: getAPIKey(),
}

export const ENTITLEMENTS = {
  PREMIUM: 'Pro',
}

// Product IDs（商品ID）の設定 - 月額のみ
export const PRODUCTS = {
  MONTHLY: 'com.itaruo93o.wakewalk.Monthly',
}

export const initializeRevenueCat = async () => {
  Purchases.setLogLevel(LOG_LEVEL.VERBOSE)

  Purchases.configure({
    apiKey: API_KEY[Platform.OS as keyof typeof API_KEY],
    appUserID: null, // nullの場合、自動生成される
  })
}

export const checkSubscriptionStatus = async (): Promise<boolean> => {
  try {
    const customerInfo: CustomerInfo = await Purchases.getCustomerInfo()
    return customerInfo.entitlements.active[ENTITLEMENTS.PREMIUM] !== undefined
  } catch (error) {
    console.error('Error checking subscription status:', error)
    return false
  }
}

// TODO: show close button
export const presentPaywall = async () => {
  try {
    const result = await RevenueCatUI.presentPaywall()
    return result
  } catch (error) {
    console.error('Paywall error:', error)
    throw error
  }
}
