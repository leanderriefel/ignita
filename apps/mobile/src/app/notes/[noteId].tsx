import { Redirect, useLocalSearchParams, useRouter } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import { Pressable, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { NoteView } from "~/components/note-views/note-view"
import { Icon } from "~/components/ui/icon"

const NotesPage = () => {
  const router = useRouter()
  const { noteId } = useLocalSearchParams()

  if (!noteId) {
    return <Redirect href="/" />
  }

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-row items-center border-b border-border px-3 py-2">
        <Pressable
          className="rounded-md p-2"
          onPress={() => router.replace("/")}
        >
          <Icon as={ChevronLeft} className="text-foreground" size={16} />
        </Pressable>
      </View>
      <NoteView noteId={noteId as string} />
    </SafeAreaView>
  )
}

export default NotesPage
