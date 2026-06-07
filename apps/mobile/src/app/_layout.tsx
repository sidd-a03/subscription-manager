import "../global.css";
import { Stack } from "expo-router";
import { HeroUINativeProvider, ToastProvider } from 'heroui-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const RootContent = () => {
  return <Stack>
    <Stack.Screen name="index" options={{ headerShown: false }} />
    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
  </Stack>
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <ToastProvider>
          <RootContent />
        </ToastProvider>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  )
}
