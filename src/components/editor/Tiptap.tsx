import { useDebounced } from "@/app/hooks/use-debounced"
import { LaTeX } from "@/components/editor/extensions/latex"
import { Loading } from "@/components/ui/loading"
import { useTRPC } from "@/lib/trpc"
import { type RouterOutputs } from "@/trpc/query-provider"
import { CheckIcon } from "@radix-ui/react-icons"
import { useMutation } from "@tanstack/react-query"
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight"
import { Placeholder } from "@tiptap/extension-placeholder"
import { EditorContent, useEditor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { all, createLowlight } from "lowlight"
import { useState } from "react"

import "./tiptap.css"
import "./theme.css"

export const Tiptap = ({
  note,
}: {
  note: NonNullable<RouterOutputs["notes"]["getNote"]>
}) => {
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(note.name)

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

  const updateNoteNameMutation = useMutation(
    trpc.notes.updateNoteName.mutationOptions({
      onMutate: () => {
        setSaving(true)
      },
      onSuccess: () => {
        setSaving(false)
      },
    }),
  )

  const lowlight = createLowlight(all)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({ placeholder: "start editing ..." }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      LaTeX,
    ],
    content: note.content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      debouncedUpdate({ id: note.id, content: editor.getHTML() })
    },
  })

  return (
    <div className="size-full relative">
      <h1 className="hidden">{note.name}</h1>
      <div className="flex justify-center">
        <input
          className="text-3xl font-extrabold mt-10 text-center focus:outline-none focus-visible:underline underline-offset-8 decoration-foreground"
          value={name}
          onInput={(e) => {
            setName(e.currentTarget.value)
          }}
          onBlur={() => {
            updateNoteNameMutation.mutate({ id: note.id, name })
          }}
        />
      </div>
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
