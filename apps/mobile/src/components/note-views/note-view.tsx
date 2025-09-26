import { Text, View } from "react-native"

import { useNote } from "@ignita/hooks"

import { Tiptap } from "~/components/note-views/text/text-note"
import { Loading } from "../ui/loading"

export const NoteView = ({ noteId }: { noteId: string }) => {
  const { data, ...query } = useNote(noteId, { enabled: !!noteId })

  if (query.isPending) {
    return (
      <View className="h-full flex-1 items-center justify-center">
        <Loading className="size-8" />
      </View>
    )
  }

  if (query.isError) {
    return (
      <View className="h-full flex-1 items-center justify-center">
        <Text className="text-destructive">
          Error loading note: {query.error.message}
        </Text>
      </View>
    )
  }

  if (!data?.note) {
    return (
      <View className="h-full flex-1 items-center justify-center">
        <Text className="text-muted-foreground">Note not found</Text>
      </View>
    )
  }

  switch (data.note.type) {
    case "text":
      return <Tiptap note={{ ...data, note: data.note }} />
    default:
      return (
        <View className="h-full flex-1 items-center justify-center">
          <Text className="text-muted-foreground">
            This note type is not yet supported in the mobile app
          </Text>
        </View>
      )
  }
}
