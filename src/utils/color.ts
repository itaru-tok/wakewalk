export const getDarkerShade = (color: string): string => {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  const darkerR = Math.max(0, r - 40)
  const darkerG = Math.max(0, g - 40)
  const darkerB = Math.max(0, b - 40)

  return `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`
}

export const getColorBrightness = (color: string): number => {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  // Using perceived brightness formula
  return (r * 299 + g * 587 + b * 114) / 1000
}
