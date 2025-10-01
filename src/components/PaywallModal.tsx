import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Linking,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Purchases from 'react-native-purchases'
import { fonts } from '../constants/theme'

interface PaywallModalProps {
  visible: boolean
  onClose: () => void
  onOpenLegalLink?: (url: string) => void
}

type Offerings = Awaited<ReturnType<typeof Purchases.getOfferings>>
type RevenueCatPackage = Offerings['current'] extends {
  availablePackages: infer Packages
}
  ? Packages extends (infer PackageType)[]
    ? PackageType
    : never
  : never

const MONTHLY_PACKAGE_ID = '$rc_monthly'
const DEFAULT_PRICE_LABEL = '$0.99/month'

export default function PaywallModal({
  visible,
  onClose,
  onOpenLegalLink,
}: PaywallModalProps) {
  const TERMS_URL = 'https://itaru-tok.github.io/wakewalk/terms-of-use'
  const PRIVACY_URL =
    'https://itaru-tok.github.io/wakewalk/privacy-policy-subscription'

  const [monthlyPackage, setMonthlyPackage] =
    useState<RevenueCatPackage | null>(null)
  const [priceLabel, setPriceLabel] = useState(DEFAULT_PRICE_LABEL)

  const resolvePriceLabel = useCallback((pkg: RevenueCatPackage | null) => {
    if (!pkg) {
      setPriceLabel(DEFAULT_PRICE_LABEL)
      return
    }

    const product = pkg.product

    // According to RevenueCat docs, the priceString property contains the localized price
    if (product && 'priceString' in product) {
      const localizedPrice = product.priceString

      if (localizedPrice) {
        setPriceLabel(`${localizedPrice}/month`)
      } else {
        setPriceLabel(DEFAULT_PRICE_LABEL)
      }
    } else {
      setPriceLabel(DEFAULT_PRICE_LABEL)
    }
  }, [])

  const fetchMonthlyPackage = useCallback(async () => {
    try {
      const offerings = await Purchases.getOfferings()
      const currentOffering = offerings.current

      const foundPackage = currentOffering?.availablePackages.find(
        (pkg) => pkg.identifier === MONTHLY_PACKAGE_ID,
      )

      const normalizedPackage = foundPackage ?? null
      setMonthlyPackage(normalizedPackage)
      resolvePriceLabel(normalizedPackage)
      return normalizedPackage
    } catch (error) {
      console.error('Error fetching offerings:', error)
      return null
    }
  }, [resolvePriceLabel])

  useEffect(() => {
    if (!visible) return

    fetchMonthlyPackage().catch(() => setPriceLabel(DEFAULT_PRICE_LABEL))
  }, [fetchMonthlyPackage, visible])

  useEffect(() => {
    resolvePriceLabel(monthlyPackage)
  }, [monthlyPackage, resolvePriceLabel])

  const handlePurchase = async () => {
    try {
      const packageToPurchase =
        monthlyPackage ?? (await fetchMonthlyPackage()) ?? null

      if (packageToPurchase) {
        await Purchases.purchasePackage(packageToPurchase)
        Alert.alert('Success', 'Subscription activated!')
        onClose()
      } else {
        Alert.alert(
          'Unavailable',
          'Monthly upgrade is not available right now.',
        )
      }
    } catch (error: unknown) {
      const purchaseCode =
        typeof error === 'object' && error !== null && 'code' in error
          ? String((error as { code?: unknown }).code)
          : undefined

      if (purchaseCode !== 'PURCHASE_CANCELLED') {
        Alert.alert('Error', 'Purchase failed. Please try again.')
      }
    }
  }

  const openLink = useCallback(async (url: string) => {
    try {
      await Linking.openURL(url)
    } catch (_error) {
      Alert.alert('Error', 'Unable to open link')
    }
  }, [])

  const handleOpenLegalLink = useCallback(
    (url: string) => {
      if (onOpenLegalLink) {
        onOpenLegalLink(url)
      } else {
        openLink(url)
      }
    },
    [onOpenLegalLink, openLink],
  )

  const handleRestorePurchases = useCallback(async () => {
    try {
      const info = await Purchases.restorePurchases()
      const hasPremium = info.entitlements.active['Pro'] !== undefined

      if (hasPremium) {
        onClose()
      }
    } catch (error) {
      console.error('Failed to restore purchases:', error)
    }
  }, [onClose])

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={{ flex: 1 }}
        locations={[0, 0.5, 1]}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between p-6 pt-12">
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          <Text
            className="text-white text-xl font-bold"
            style={{ fontFamily: fonts.comfortaa.bold }}
          >
            Pro Plan
          </Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
        >
          {/* Features */}
          <View className="mb-4">
            <Text
              className="text-white text-3xl text-center mb-4"
              style={{ fontFamily: fonts.comfortaa.bold }}
            >
              Monthly Upgrade
            </Text>
            <Text
              className="text-white/90 text-lg text-center mb-8"
              style={{ fontFamily: fonts.comfortaa.regular }}
            >
              Unlock gradient themes and Ad-Free Experience.
            </Text>

            <View className="bg-white/10 rounded-2xl p-6 mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="color-palette" size={24} color="#F59E0B" />
                <Text
                  className="text-white text-lg ml-3"
                  style={{ fontFamily: fonts.comfortaa.medium }}
                >
                  Gradient Themes
                </Text>
              </View>
              <Text
                className="text-white/80 mb-4"
                style={{ fontFamily: fonts.comfortaa.regular }}
              >
                Customize up to 3 colors in your gradients for truly
                personalized themes
              </Text>
            </View>

            <View className="bg-white/10 rounded-2xl p-6 mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="eye-off" size={24} color="#F59E0B" />
                <Text
                  className="text-white text-lg ml-3"
                  style={{ fontFamily: fonts.comfortaa.medium }}
                >
                  Ad-Free Experience
                </Text>
              </View>
              <Text
                className="text-white/80 mb-4"
                style={{ fontFamily: fonts.comfortaa.regular }}
              >
                Enjoy an uninterrupted, ad-free morning routine without any
                distractions
              </Text>
            </View>
          </View>

          {/* Subscription Info */}
          <View className="mb-8">
            <Text className="text-white/70 text-xs text- leading-5">
              Your subscription will automatically renew for {priceLabel} unless
              canceled at least 24 hours before the end of the current period.
              Payment will be charged to your Apple ID account. Manage or cancel
              your subscription in your App Store account settings.
            </Text>
          </View>

          {/* Purchase Button */}
          <TouchableOpacity
            onPress={handlePurchase}
            className="bg-yellow-500 rounded-2xl py-4 mb-4"
          >
            <Text
              className="text-black text-xl text-center font-bold"
              style={{ fontFamily: fonts.comfortaa.bold }}
            >
              Upgrade for {priceLabel}
            </Text>
          </TouchableOpacity>

          {/* Terms and Privacy Agreement */}
          <View className="mb-4">
            <Text
              className="text-white/60 text-sm text-center mb-2"
              style={{ fontFamily: fonts.comfortaa.regular }}
            >
              By purchasing the monthly upgrade, you agree to our{' '}
              <Text
                className="text-white/80 underline"
                onPress={() => handleOpenLegalLink(TERMS_URL)}
                style={{ fontFamily: fonts.comfortaa.semiBold }}
              >
                Terms of Use
              </Text>{' '}
              and{' '}
              <Text
                className="text-white/80 underline"
                onPress={() => handleOpenLegalLink(PRIVACY_URL)}
                style={{ fontFamily: fonts.comfortaa.semiBold }}
              >
                Privacy Policy
              </Text>
              .
            </Text>
          </View>

          {/* Restore Button */}
          <TouchableOpacity onPress={handleRestorePurchases} className="mb-8">
            <Text
              className="text-white/80 text-center underline"
              style={{ fontFamily: fonts.comfortaa.regular }}
            >
              Restore Purchases
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </Modal>
  )
}
