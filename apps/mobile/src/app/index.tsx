import { Redirect } from "expo-router"
import { Pressable, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { signOut, useSession } from "~/lib/auth/auth-client"

const Home = () => {
  const session = useSession()

  if (session.isPending) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    )
  }

  if (!session.data) {
    return <Redirect href="/auth/sign-in" />
  }

  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-4">
      <Text className="text-2xl font-bold text-red-500">Home</Text>
      <Text>{session.data.user.name}</Text>
      <Text>{session.data.user.email}</Text>
      <Pressable
        className="rounded-lg border border-foreground px-4 py-2"
        onPress={() => signOut()}
      >
        <Text>Sign Out</Text>
      </Pressable>
    </SafeAreaView>
  )
}

export default Home

