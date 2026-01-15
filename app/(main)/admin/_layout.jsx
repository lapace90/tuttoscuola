import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="classes" />
      <Stack.Screen name="subjects" />
      <Stack.Screen name="admins" />
      <Stack.Screen name="promotions" />
    </Stack>
  );
}