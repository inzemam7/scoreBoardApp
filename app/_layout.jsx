// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
// import 'react-native-reanimated';
import { Colors } from '@/constants/Colors';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Appearance } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = Appearance.getColorScheme()
  const theme =colorScheme === 'dark' ? Colors.dark : Colors.light;

  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
   <>
    <Stack screenOptions={{headerStyle : {backgroundColor: theme.headerBackground},headerTintColor: theme.text, headerShadowVisible: false}}>
        <Stack.Screen name='index' options={{title:"Home", headerShown: false}}/>
        <Stack.Screen name='cricket' options={{title:"Cricket", headerShown: false}}/>
        <Stack.Screen name='football' options={{title:"Football", headerShown: false}}/>
        <Stack.Screen name='aboutUs' options={{title:"About Us", headerShown: false}}/>
        <Stack.Screen name='cricSingle' options={{title:"cricSingle", headerShown: false}}/>
        <Stack.Screen name='cricTournamentSetup' options={{title:"cricTournament", headerShown: false}}/>
        <Stack.Screen name="+not-found" />
    </Stack>
    <StatusBar style="auto" />
  </>);
}
