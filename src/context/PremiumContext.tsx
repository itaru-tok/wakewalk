import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { AppState } from 'react-native'
import Purchases, {
  type CustomerInfoUpdateListener,
} from 'react-native-purchases'
import { checkSubscriptionStatus } from '../utils/revenuecat'

interface PremiumContextType {
  isPremium: boolean
  setIsPremium: (premium: boolean) => void
  isLoading: boolean
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined)

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        const premiumStatus = await checkSubscriptionStatus()
        setIsPremium(premiumStatus)
      } catch (error) {
        console.error('Error checking subscription status:', error)
        setIsPremium(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkPremiumStatus()

    // 課金状態が変更された時にリアルタイムで更新
    const customerInfoUpdateListener: CustomerInfoUpdateListener = (
      customerInfo,
    ) => {
      const premiumStatus = customerInfo.entitlements.active.Pro !== undefined
      console.log('Premium status updated:', premiumStatus)
      setIsPremium(premiumStatus)
    }

    // CustomerInfo更新リスナーを設定（課金直後に即座に反映）
    Purchases.addCustomerInfoUpdateListener(customerInfoUpdateListener)

    // アプリがフォアグラウンドに戻った時にチェック
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        checkPremiumStatus()
      }
    }

    // アプリ状態の変更を監視（オプション）
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    )

    return () => {
      subscription?.remove()
      Purchases.removeCustomerInfoUpdateListener(customerInfoUpdateListener)
    }
  }, [])

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        setIsPremium,
        isLoading,
      }}
    >
      {children}
    </PremiumContext.Provider>
  )
}

export function usePremium() {
  const context = useContext(PremiumContext)
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider')
  }
  return context
}
