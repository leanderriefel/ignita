import { Redirect } from "expo-router"
import { SafeAreaView, Text, View } from "react-native"

import { useAuth } from "../../providers/auth"

export default function TabTwoScreen() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />
  }
  return (
    <SafeAreaView style={{ flex: 1, padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 28, fontWeight: "600" }}>Explore</Text>
      <View>
        <Text>Baseline screen.</Text>
      </View>
    </SafeAreaView>
  )
}

