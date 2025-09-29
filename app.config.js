import 'dotenv/config'

export default {
  expo: {
    name: 'WakeWalk',
    slug: 'wakewalk',
    version: '1.0.0',
    owner: 'itaruo93o',
    scheme: 'wakewalk',
    userInterfaceStyle: 'automatic',

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
      './plugins/withAlarmManager',
      [
        'react-native-google-mobile-ads',
        {
          androidAppId: 'ca-app-pub-7995063718547265~4504119427',
          iosAppId: 'ca-app-pub-7995063718547265~4504119427',
          delay_app_measurement_init: true,
        },
      ],
    ],

    experiments: {
      typedRoutes: true,
    },

    ios: {
      bundleIdentifier: 'com.itaruo93o.wakewalk',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        UNNotificationExtensionCategory: ['ALARM_CATEGORY'],
        NSMotionUsageDescription:
          'WakeWalk uses your motion activity to count wake-walk steps.',
        UIBackgroundModes: ['audio', 'fetch', 'remote-notification'],
      },
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
