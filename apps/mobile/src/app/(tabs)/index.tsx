import { Link, Redirect } from "expo-router"
import { Pressable, SafeAreaView, Text, View } from "react-native"

import { useAuth } from "../../providers/auth"

export default function HomeScreen() {
  const { isAuthenticated, signOut } = useAuth()
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />
  }
  return (
    <SafeAreaView className="flex-1 gap-12 p-12">
      <Text className="mt-12 text-2xl font-bold">Home</Text>
      <View className="flex-row gap-12">
        <Pressable onPress={signOut} className="rounded-md border p-12">
          <Text>Sign out</Text>
        </Pressable>
        <Link href="/(tabs)/explore" className="p-12">
          Explore
        </Link>
      </View>
    </SafeAreaView>
  )
}

