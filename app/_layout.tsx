import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useThemeStore } from '../store/useThemeStore';
import { useUserStore } from '../store/useUserStore';
import { useLibraryStore } from '../store/useLibraryStore';
import { useProgressStore } from '../store/useProgressStore';
import { useSessionStore } from '../store/useSessionStore';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const { initTheme, resolved } = useThemeStore();
  const { loadUser } = useUserStore();
  const { loadLibrary } = useLibraryStore();
  const { loadProgress } = useProgressStore();
  const { loadSessions } = useSessionStore();

  useEffect(() => {
    Promise.all([initTheme(), loadUser(), loadLibrary(), loadProgress(), loadSessions()])
      .finally(() => setReady(true));
  }, []);

  if (!ready) return <View style={{ flex: 1, backgroundColor: '#0D0D0D' }} />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding/index" options={{ animation: 'fade' }} />
          <Stack.Screen name="generate/[type]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="flashcards/[setId]" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="quiz/[quizId]" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="study/[sessionId]" />
          <Stack.Screen name="topic/[topicId]" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
