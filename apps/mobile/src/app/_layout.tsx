import { QueryProvider } from "~/lib/trpc/query-provider"

import "./global.css"

import { Stack } from "expo-router"
import { StatusBar } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"

export default function RootLayout() {
  return (
    <QueryProvider>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </QueryProvider>
  )
}

