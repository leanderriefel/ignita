import { PortalHost } from "@rn-primitives/portal"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"

import "react-native-reanimated"
import "./global.css"

import { View } from "react-native"

import { QueryProvider } from "~/lib/trpc/query-provider"

const RootLayout = () => {
  const [loaded] = useFonts({
    Geist: require("../assets/fonts/Geist.ttf"),
    GeistMono: require("../assets/fonts/GeistMono.ttf"),
  })

  // Async font loading only occurs in development.
  if (!loaded) return null

  return (
    <View className="flex-1 bg-background text-foreground">
      <QueryProvider>
        <StatusBar style="auto" />
        <Stack>
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <PortalHost />
      </QueryProvider>
    </View>
  )
}

export default RootLayout

