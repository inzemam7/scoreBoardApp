import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack 
        screenOptions={{
          headerStyle: {backgroundColor: '#222'},
          headerTintColor: '#FFFFFF',
          headerShadowVisible: false,
          headerShown: false
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="cricket" />
        <Stack.Screen name="football" />
        <Stack.Screen name="aboutUs" />
        <Stack.Screen name="cricSingle" />
        <Stack.Screen name="cricTournamentSetup" />
        <Stack.Screen name="matchScreen" />
        <Stack.Screen name="singleMatchHistory" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
} 