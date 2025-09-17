import { Dimensions, PixelRatio } from 'react-native'

// Background image sources
const backgroundImages = {
  small: require('../../assets/images/background-480.jpg'),
  medium: require('../../assets/images/background-720.jpg'),
  large: require('../../assets/images/background-optimized.jpg'),
}

/**
 * Returns the optimal background image based on screen size and pixel density.
 */
export const getOptimalBackgroundImage = () => {
  const { width, height } = Dimensions.get('window')
  const pixelRatio = PixelRatio.get()

  // Calculate the actual pixel resolution
  const actualWidth = width * pixelRatio
  const actualHeight = height * pixelRatio
  const maxDimension = Math.max(actualWidth, actualHeight)

  // Pick the best image for the current device resolution
  if (maxDimension <= 480) {
    return backgroundImages.small // ~23KB
  } else if (maxDimension <= 720) {
    return backgroundImages.medium // ~57KB
  } else {
    return backgroundImages.large // ~133KB (used for 1080px and above as well)
  }
}
