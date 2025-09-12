import React from 'react';
import { Tabs } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'ホーム' }} />
        <Tabs.Screen name="settings" options={{ title: '設定' }} />
      </Tabs>
    </SafeAreaProvider>
  );
}
