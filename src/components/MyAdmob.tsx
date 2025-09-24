import {
  BannerAd,
  type BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads'

interface Props {
  size: BannerAdSize
}

const PRODUCTION_BANNER_ID = 'ca-app-pub-7995063718547265/1531359779'

export default function MyAdmob(props: Props) {
  const unitId = __DEV__ ? TestIds.BANNER : PRODUCTION_BANNER_ID

  return <BannerAd {...props} unitId={unitId} />
}
