import { Redirect } from "expo-router"
import { Pressable, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { Loading } from "~/components/ui/loading"
import { signOut, useSession } from "~/lib/auth/auth-client"

const HomeScreen = () => {
  const session = useSession()

  if (session.isPending) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Loading />
      </SafeAreaView>
    )
  }

  if (!session.data) {
    return <Redirect href="/auth/sign-in" />
  }

  return (
    <View className="flex-1 items-center justify-center">
      <Text>Home</Text>
      <Text>{session.data?.user.email ?? "No session"}</Text>
      <Pressable
        onPress={async () => {
          console.log("pre")
          try {
            await signOut()
          } catch (error) {
            console.log("error", error)
          }
          console.log("post")
        }}
        className="rounded-md bg-red-500 p-2"
      >
        <Text>Logout</Text>
      </Pressable>
    </View>
  )
}

export default HomeScreen
