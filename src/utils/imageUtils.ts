import { Dimensions, PixelRatio } from 'react-native'

// 背景画像のソース
const backgroundImages = {
  small: require('../../assets/images/background-480.jpg'),
  medium: require('../../assets/images/background-720.jpg'),
  large: require('../../assets/images/background-optimized.jpg'),
}

/**
 * デバイスのスクリーンサイズとピクセル密度に基づいて
 * 最適な背景画像を返す
 */
export const getOptimalBackgroundImage = () => {
  const { width, height } = Dimensions.get('window')
  const pixelRatio = PixelRatio.get()

  // 実際のピクセル解像度を計算
  const actualWidth = width * pixelRatio
  const actualHeight = height * pixelRatio
  const maxDimension = Math.max(actualWidth, actualHeight)

  // デバイスの解像度に応じて最適な画像を選択
  if (maxDimension <= 480) {
    return backgroundImages.small // ~23KB
  } else if (maxDimension <= 720) {
    return backgroundImages.medium // ~57KB
  } else {
    return backgroundImages.large // ~133KB (1080px以上も同じ画像を使用)
  }
}
