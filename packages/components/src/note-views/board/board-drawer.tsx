"use client"

import { useRef, useState } from "react"
import { CheckIcon } from "@radix-ui/react-icons"
import type { Content, Editor } from "@tiptap/react"

import {
  useUpdateBoardCardContent,
  useUpdateBoardCardTitle,
} from "@ignita/hooks"
import { useDebounced } from "@ignita/lib/use-debounced"

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../../ui/drawer"
import { Loading } from "../../ui/loading"
import { TextEditor } from "../text/text-editor"
import type { NoteProp } from "../types"
import type { Card } from "./types"

export const BoardDrawer = ({
  note,
  card,
  onSaveAndClose,
}: {
  note: NoteProp<"board">
  card: Card | null
  onSaveAndClose: (
    titleValue: string,
    content: Content,
    currentCard: Card | null,
  ) => void
}) => {
  const [saving, setSaving] = useState(false)

  const editorRef = useRef<Editor | null>(null)
  const titleInputRef = useRef<HTMLInputElement | null>(null)

  const latestContentRef = useRef<Content>(card?.content ?? "")

  const updateBoardCardTitle = useUpdateBoardCardTitle({
    onMutate: () => setSaving(true),
    onSuccess: () => setSaving(false),
  })

  const updateBoardCardContent = useUpdateBoardCardContent({
    onMutate: () => setSaving(true),
    onSuccess: () => setSaving(false),
  })

  const updateCardName = (title: string) => {
    if (!card) return

    updateBoardCardTitle.mutate({
      noteId: note.id,
      cardId: card.id,
      title,
    })
  }

  const updateCardContent = (content: Content) => {
    if (!card) return

    updateBoardCardContent.mutate({
      noteId: note.id,
      cardId: card.id,
      content,
    })
  }

  const {
    callback: debouncedContentSave,
    cancel: cancelContentDebounce,
    isPending: isTyping,
  } = useDebounced(updateCardContent, 800)

  const saveTitleIfChanged = () => {
    const newTitle = titleInputRef.current?.value.trim() ?? ""
    if (!card || newTitle === card.title) return
    updateCardName(newTitle)
  }

  const flushPendingSaves = () => {
    if (!card) return
    saveTitleIfChanged()
    cancelContentDebounce()

    if (latestContentRef.current) updateCardContent(latestContentRef.current)
  }

  return (
    <Drawer
      direction="right"
      open={!!card}
      onOpenChange={(open) => {
        if (!open) {
          cancelContentDebounce()
          const titleValue = titleInputRef.current?.value.trim() ?? ""
          onSaveAndClose(titleValue, latestContentRef.current, card)
        }
      }}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle asChild>
            <input
              ref={titleInputRef}
              key={card?.id ?? "drawer-title"}
              className="decoration-foreground text-lg font-semibold tracking-wide underline-offset-4 focus:outline-none focus-visible:underline"
              defaultValue={card?.title ?? ""}
              placeholder="New Card"
              maxLength={50}
              minLength={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  saveTitleIfChanged()
                  flushPendingSaves()
                  e.currentTarget.blur()
                }
              }}
              onBlur={saveTitleIfChanged}
            />
          </DrawerTitle>
          <DrawerDescription className="inline-flex w-fit items-center gap-x-1 rounded-sm border py-0.5 pr-3.5 pl-4 text-xs">
            {isTyping ? "Typing" : saving ? "Saving" : "Saved"}
            {(saving || isTyping) && <Loading className="size-3" />}
            {!isTyping && !saving && <CheckIcon className="size-3" />}
          </DrawerDescription>
        </DrawerHeader>
        <div className="mt-4 p-4">
          <TextEditor
            value={card?.content ?? ""}
            onChange={(content) => {
              latestContentRef.current = content
              debouncedContentSave(content)
            }}
            onEditorReady={(editor) => {
              editorRef.current = editor
            }}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
