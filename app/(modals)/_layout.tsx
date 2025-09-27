import { Stack } from 'expo-router'

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerShown: false,
        animation: 'slide_from_bottom',
      }}
    >
      <Stack.Screen name="sound" />
      <Stack.Screen name="duration" />
      <Stack.Screen name="snooze" />
    </Stack>
  )
}
