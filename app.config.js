import 'dotenv/config'

// ビルドバリアントに応じてバンドルIDを決定
// APP_VARIANT を最優先にし、次に EAS_BUILD_PROFILE を参照
const getBundleIdentifier = () => {
  const baseBundleId = 'com.itaruo93o.wakewalk'
  const variant =
    process.env.APP_VARIANT ?? process.env.EAS_BUILD_PROFILE ?? 'development'

  if (variant === 'development') {
    return `${baseBundleId}.dev`
  }
  if (variant === 'personal') {
    return `${baseBundleId}.personal`
  }
  // preview / production は本番と同じ
  return baseBundleId
}

// OTA更新の設定（開発時のみ無効化）
const getUpdatesConfig = () => {
  const variant =
    process.env.APP_VARIANT ?? process.env.EAS_BUILD_PROFILE ?? 'development'

  return {
    enabled: variant !== 'development', // 開発環境のみ無効
    url: 'https://u.expo.dev/bab41865-be8c-4986-a1a4-fbae81a463e4',
  }
}

export default {
  expo: {
    name: 'WakeWalk',
    slug: 'wakewalk',
    version: '1.0.0',
    owner: 'itaruo93o',
    scheme: 'wakewalk',
    userInterfaceStyle: 'automatic',
    runtimeVersion: '1.0.0',
    updates: getUpdatesConfig(),

    plugins: [
      'expo-router',
      'expo-font',
      'expo-dev-client',
      [
        'expo-notifications',
        {
          iosDisplayInForeground: true,
          sounds: [
            './assets/sound/alarm-loop.m4a',
            './assets/sound/bird_01_pigeon.m4a',
            './assets/sound/bird_02_sparrow.m4a',
            './assets/sound/bird_03_sea.m4a',
            './assets/sound/bird_04_river.m4a',
            './assets/sound/bird_05_Japanese_nightingale.m4a',
            './assets/sound/insect_01.m4a',
            './assets/sound/insect_02.m4a',
            './assets/sound/insect_03.m4a',
            './assets/sound/insect_04.m4a',
            './assets/sound/insect_05.m4a',
          ],
        },
      ],
      [
        'react-native-google-mobile-ads',
        {
          androidAppId: 'ca-app-pub-7995063718547265~4504119427',
          iosAppId: 'ca-app-pub-7995063718547265~4504119427',
          delay_app_measurement_init: true,
        },
      ],
      [
        'expo-splash-screen',
        {
          backgroundColor: '#ffffff',
          image: './assets/wakewalk-icon.png',
          resizeMode: 'contain',
          dark: {
            image: './assets/wakewalk-icon.png',
            backgroundColor: '#000000',
          },
          imageWidth: 200,
        },
      ],
      // Must be last to fix AppDelegate.swift after expo-dev-client
      './plugins/withAlarmManager',
    ],

    experiments: {
      typedRoutes: true,
    },

    ios: {
      bundleIdentifier: getBundleIdentifier(),
      supportsTablet: false,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        UNNotificationExtensionCategory: ['ALARM_CATEGORY'],
        NSMotionUsageDescription:
          'WakeWalk uses your motion activity to count wake-walk steps.',
        UIBackgroundModes: ['audio', 'fetch', 'remote-notification'],
      },
      icon: './assets/wakewalk.icon',
    },

    android: {
      package: 'com.itaruo93o.wakewalk',
      permissions: ['NOTIFICATIONS'],
    },

    extra: {
      router: {},
      eas: {
        projectId: 'bab41865-be8c-4986-a1a4-fbae81a463e4',
      },

      revenueCatApiKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
      admobBannerId: process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER,
    },
  },
}
