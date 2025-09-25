import Constants from 'expo-constants'
import {
  BannerAd,
  type BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads'

interface Props {
  size: BannerAdSize
}

export default function MyAdmob(props: Props) {
  const getAdMobId = () => {
    if (__DEV__) {
      return TestIds.BANNER
    }
    return Constants.expoConfig?.extra?.admobBannerId
  }

  const unitId = getAdMobId()

  return <BannerAd {...props} unitId={unitId} />
}
