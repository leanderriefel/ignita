import { Link, Stack } from "expo-router"
import { Text, View } from "react-native"

export default function NotFoundScreen() {
  return (
    <View className="flex-1">
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center p-4">
        <Text>This screen does not exist.</Text>
        <Link href="/" className="mt-4 py-4">
          <Text>Go to home screen!</Text>
        </Link>
      </View>
    </View>
  )
}

