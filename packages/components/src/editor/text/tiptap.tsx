"use client"

import "./tiptap.css"
import "./theme.css"

import { useEffect, useState } from "react"
import { CheckIcon } from "@radix-ui/react-icons"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight"
import { Placeholder } from "@tiptap/extensions"
import { EditorContent, useEditor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { all, createLowlight } from "lowlight"

import type { TextNote } from "@nuotes/lib/notes"
import { useDebounced } from "@nuotes/lib/use-debounced"
import type { RouterOutputs } from "@nuotes/trpc"
import { useTRPC } from "@nuotes/trpc/client"

import { Loading } from "../../ui/loading"
import { LaTeX } from "./extensions/latex"

export const Tiptap = ({
  note,
}: {
  note: NonNullable<RouterOutputs["notes"]["getNote"]>
}) => {
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(note.name)

  let isUpdatingProgrammatically = false

  const trpc = useTRPC()
  const queryClient = useQueryClient()

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
    content: note.note.content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (!isUpdatingProgrammatically) {
        debouncedUpdate({
          id: note.id,
          note: { type: "text", content: editor.getHTML() } satisfies TextNote,
        })
        queryClient.setQueryData(trpc.notes.getNote.queryKey({ id: note.id }), {
          ...note,
          note: { type: "text", content: editor.getHTML() },
        })
      }
    },
  })

  // Update editor content when note changes
  useEffect(() => {
    if (editor && note.note.content !== editor.getHTML()) {
      isUpdatingProgrammatically = true
      editor.commands.setContent(note.note.content)
      isUpdatingProgrammatically = false
    }
  }, [editor, note.note.content])

  // Update name state when note changes
  useEffect(() => {
    setName(note.name)
  }, [note.name])

  return (
    <div className="relative mx-auto size-full min-h-full max-w-3xl px-6 pt-20">
      <h1 className="hidden">{note.name}</h1>
      <div className="flex justify-center">
        <input
          className="decoration-foreground mt-10 text-center text-3xl font-medium tracking-wide underline-offset-8 focus:outline-none focus-visible:underline"
          value={name}
          onInput={(e) => {
            setName(e.currentTarget.value)
          }}
          onBlur={() => {
            updateNoteNameMutation.mutate({ id: note.id, name })
          }}
        />
      </div>
      <div className="mt-2 mb-10 flex w-full justify-center">
        <p className="inline-flex w-fit items-center gap-x-1 rounded-sm border py-0.5 pr-3.5 pl-4 text-xs">
          {isTyping ? "Typing" : saving ? "Saving" : "Saved"}
          {(saving || isTyping) && <Loading className="size-3" />}
          {!isTyping && !saving && <CheckIcon className="size-3" />}
        </p>
      </div>
      <EditorContent editor={editor} spellCheck="false" />
    </div>
  )
}
