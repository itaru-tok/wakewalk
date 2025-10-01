export const colors = {
  primary: '#26252F',
  secondary: '#5C5C5F',
  accent: '#D9D9D9',
}

export const fonts = {
  comfortaa: {
    regular: 'Comfortaa_400Regular',
    medium: 'Comfortaa_500Medium',
    semiBold: 'Comfortaa_600SemiBold',
    bold: 'Comfortaa_700Bold',
  },
  inter: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
  },
}

export const sizes = {
  time: {
    inactive: 38,
    active: 50,
  },
  setting: {
    title: 16,
    subtitle: 10,
  },
  navigation: {
    label: 12,
  },
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
}

export const theme = {
  colors: {
    background: colors.primary,
    text: {
      primary: colors.accent,
      secondary: colors.secondary,
    },
  },
  contribution: {
    colors: {
      perfect: '#2EA043',
      good: '#7BC96F',
      // Use the same neutral tone for "missed" and placeholder days
      // so there are no nearly-black squares in the grid.
      missed: '#3D3D3D',
      empty: '#3D3D3D',
    },
  },
}

// export const colors = {
//   primary: 'rgba(0,0,0,0.8)',
//   accent: '#ffffff',
//   glassBackground: 'rgba(255,255,255,0.15)',
//   glassBorder: 'rgba(255,255,255,0.3)',
//   textPrimary: '#ffffff',
//   textSecondary: 'rgba(255,255,255,0.7)',
// };

export const glassStyles = {
  container: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  text: {
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
}
