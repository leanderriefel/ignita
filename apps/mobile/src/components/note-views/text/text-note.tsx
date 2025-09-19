import { useEffect, useRef, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Check } from "lucide-react-native"
import { ScrollView, Text, TextInput, View } from "react-native"

import type { TextNote } from "@ignita/lib/notes"
import { useDebounced } from "@ignita/lib/use-debounced"
import { useTRPC } from "@ignita/trpc/client"

import TextEditor from "~/components/editor/text-editor"
import { Icon } from "~/components/ui/icon"
import { Loading } from "~/components/ui/loading"

type NotePropText = {
  id: string
  name: string
  workspaceId: string
  note: { type: "text"; content: import("@tiptap/react").JSONContent }
}

export const Tiptap = ({ note }: { note: NotePropText }) => {
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(note.name)
  const [webviewLoading, setWebviewLoading] = useState(true)

  const editorReadyRef = useRef<boolean>(false)
  const titleRef = useRef<TextInput | null>(null)
  const trpc = useTRPC()

  const updateNoteContentMutation = useMutation(
    trpc.notes.updateNoteContent.mutationOptions({
      onMutate: () => setSaving(true),
      onSuccess: () => setSaving(false),
    }),
  )

  const { callback: debouncedUpdate, isPending: isTyping } = useDebounced(
    updateNoteContentMutation.mutate,
    1000,
  )

  const updateNoteNameMutation = useMutation(
    trpc.notes.updateNoteName.mutationOptions({
      onMutate: () => setSaving(true),
      onSuccess: () => setSaving(false),
    }),
  )

  useEffect(() => {
    setName(note.name)
  }, [note.name])

  return (
    <View className="w-full flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow"
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full grow px-6 py-2">
          <View className="items-center">
            <Text className="sr-only">{note.name}</Text>
            <TextInput
              ref={titleRef}
              className="mt-10 text-center text-3xl font-medium tracking-wide decoration-foreground underline-offset-8"
              value={name}
              maxLength={12}
              onChangeText={setName}
              returnKeyType="done"
              submitBehavior="blurAndSubmit"
              onSubmitEditing={() => {
                titleRef.current?.blur()
              }}
              onBlur={() => {
                if (!name) return
                updateNoteNameMutation.mutate({ id: note.id, name })
              }}
            />
          </View>
          <View className="mb-10 mt-2 w-full items-center justify-center">
            <View className="inline-flex w-auto flex-row items-center gap-x-2 rounded-lg border py-0.5 pl-4 pr-3.5">
              <Text className="text-xs">
                {isTyping ? "Typing" : saving ? "Saving" : "Saved"}
              </Text>
              {(saving || isTyping) && <Loading className="size-3" />}
              {!isTyping && !saving && <Icon as={Check} className="size-3" />}
            </View>
          </View>
          <View className="relative flex-1">
            <TextEditor
              docId={note.id}
              value={note.note.content}
              dom={{
                onLoadStart: () => setWebviewLoading(true),
                onLoadEnd: () => setWebviewLoading(false),
                webviewDebuggingEnabled: false,
                showsHorizontalScrollIndicator: false,
                showsVerticalScrollIndicator: true,
                bounces: false,
                nestedScrollEnabled: true,
                containerStyle: {
                  overflow: "visible",
                  backgroundColor: "transparent",
                  borderWidth: 0,
                },
                style: {
                  backgroundColor: "transparent",
                },
              }}
              onChange={async (content) =>
                debouncedUpdate({
                  id: note.id,
                  note: { type: "text", content } as TextNote,
                })
              }
              onReady={async () => {
                editorReadyRef.current = true
              }}
            />
            {webviewLoading && (
              <View className="pointer-events-none absolute inset-0 items-center justify-center">
                <Loading className="size-6" />
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

