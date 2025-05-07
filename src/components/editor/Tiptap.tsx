import { useTRPC } from "@/lib/trpc"
import { type RouterOutputs } from "@/trpc/Provider"
import { useMutation } from "@tanstack/react-query"
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight"
import { Placeholder } from "@tiptap/extension-placeholder"
import { EditorContent, useEditor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { all, createLowlight } from "lowlight"

import "katex/dist/katex.min.css"
import "./tiptap.css"
import "./theme.css"

import { useDebounced } from "@/app/hooks/use-debounced"
import { Loading } from "@/components/ui/Loading"
import { CheckIcon } from "@radix-ui/react-icons"
import { useState } from "react"

export const Tiptap = ({
  note,
}: {
  note: NonNullable<RouterOutputs["notes"]["getNote"]>
}) => {
  const [saving, setSaving] = useState(false)

  const trpc = useTRPC()
  const updateNoteContentMutation = useMutation(
    trpc.notes.updateNoteContent.mutationOptions({
      onMutate: () => {
        setSaving(true)
      },
      onSuccess: () => {
        setSaving(false)
      },
    }),
  )
  const { callback: debouncedUpdate, isLoading: isTyping } = useDebounced(
    updateNoteContentMutation.mutate,
    1000,
  )

  const lowlight = createLowlight(all)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "start editing ..." }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: note.content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      debouncedUpdate({ id: note.id, content: editor.getHTML() })
    },
  })

  return (
    <div className="size-full relative">
      <h1 className="text-3xl font-extrabold mt-10 text-center">{note.name}</h1>
      <div className="w-full flex justify-center mt-2 mb-10">
        <p className="border w-fit pl-4 pr-3.5 py-0.5 rounded-full text-xs gap-x-1 inline-flex items-center">
          {isTyping ? "Typing" : saving ? "Saving" : "Saved"}
          {(saving || isTyping) && <Loading className="size-3" />}
          {!isTyping && !saving && <CheckIcon className="size-3" />}
        </p>
      </div>
      <EditorContent editor={editor} spellCheck="false" />
    </div>
  )
}
