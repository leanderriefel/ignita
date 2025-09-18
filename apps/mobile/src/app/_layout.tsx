import { PortalHost } from "@rn-primitives/portal"

import { QueryProvider } from "~/lib/trpc/query-provider"

import "./global.css"

import { Stack } from "expo-router"
import { StatusBar } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"

import { NotesSessionPersist } from "~/lib/store/notes-session-persist"

export default function RootLayout() {
  return (
    <QueryProvider>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <NotesSessionPersist />
        <Stack screenOptions={{ headerShown: false }} />
        <PortalHost />
      </SafeAreaProvider>
    </QueryProvider>
  )
}

