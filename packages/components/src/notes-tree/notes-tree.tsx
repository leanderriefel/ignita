"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  dragAndDropFeature,
  isOrderedDragTarget,
  keyboardDragAndDropFeature,
  selectionFeature,
  syncDataLoaderFeature,
  type FeatureImplementation,
} from "@headless-tree/core"
import { AssistiveTreeDescription, useTree } from "@headless-tree/react"
import { useStore } from "@tanstack/react-store"
import { motion } from "motion/react"

import { useMoveNote, useNotes } from "@ignita/hooks"
import { notesSessionStore, setNote } from "@ignita/lib"
import { NEW_NOTE_POSITION, NOTE_GAP } from "@ignita/lib/notes"

import {
  CreateNoteDialog,
  type CreateNoteDialogRef,
  type CreateNoteDialogTarget,
} from "../dialogs/create-note-dialog"
import { DeleteNoteDialog } from "../dialogs/delete-note-dialog"
import { Button } from "../ui/button"
import { Loading } from "../ui/loading"
import { NoteTreeItem } from "./note-tree-item"
import { buildTree, INDENTATION_WIDTH, ROOT_ID, type TreeNote } from "./utils"

const customClickBehavior: FeatureImplementation = {
  itemInstance: {
    getProps: ({ tree, item, prev }) => ({
      ...prev?.(),
      onClick: (e: MouseEvent) => {
        if (e.shiftKey) {
          item.selectUpTo(e.ctrlKey || e.metaKey)
        } else if (e.ctrlKey || e.metaKey) {
          item.toggleSelect()
        } else {
          tree.setSelectedItems([item.getItemMeta().itemId])
        }

        item.setFocused()
        setNote(item.getItemData().id)
      },
    }),
  },
}

export const NotesTree = () => {
  const { workspaceId } = useStore(notesSessionStore)

  const notes = useNotes(
    { workspaceId: workspaceId ?? "" },
    { enabled: !!workspaceId },
  )
  const moveNote = useMoveNote({ workspaceId: workspaceId ?? "" })

  const treeItems = useMemo(() => buildTree(notes.data), [notes.data])

  const notesById = useMemo(() => {
    const map = new Map<string, TreeNote>()
    Object.entries(treeItems).forEach(([id, item]) => {
      map.set(id, item)
    })
    return map
  }, [treeItems])

  useEffect(() => {
    tree.rebuildTree()
  }, [treeItems])

  const tree = useTree<TreeNote>({
    rootItemId: "root",
    canReorder: true,
    isItemFolder: () => true,
    getItemName: (item) => item.getItemData().name,
    dataLoader: {
      getChildren: (itemId) => treeItems[itemId]?.children ?? [],
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      getItem: (itemId) => treeItems[itemId]!,
    },
    indent: INDENTATION_WIDTH,
    onDrop: (items, target) => {
      const item = items[0]
      if (!item) return

      let newParentId: string | null = target.item.getItemData().id
      if (newParentId === ROOT_ID) newParentId = null

      const sortedChildren = target.item
        .getChildren()
        .sort((a, b) => b.getItemData().position - a.getItemData().position)

      const highestPosition = sortedChildren.at(0)?.getItemData().position
      const lowestPosition = sortedChildren.at(-1)?.getItemData().position

      let newPosition: number | undefined

      if (isOrderedDragTarget(target)) {
        if (target.insertionIndex === 0) {
          // dropped before first note
          newPosition =
            typeof highestPosition !== "undefined"
              ? highestPosition + NOTE_GAP
              : NEW_NOTE_POSITION
        } else if (
          target.insertionIndex ===
          target.item.getChildren().length - 1
        ) {
          // dropped after last note
          newPosition =
            typeof lowestPosition !== "undefined"
              ? lowestPosition - NOTE_GAP
              : NEW_NOTE_POSITION
        } else {
          // dropped between notes
          const prevSibling = sortedChildren[target.childIndex - 1]
          const nextSibling = sortedChildren[target.childIndex]

          if (!prevSibling && !nextSibling) {
            newPosition = NEW_NOTE_POSITION
          } else if (!prevSibling) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            newPosition = nextSibling!.getItemData().position - NOTE_GAP
          } else if (!nextSibling) {
            newPosition = prevSibling.getItemData().position + NOTE_GAP
          } else {
            newPosition = Math.floor(
              prevSibling.getItemData().position -
                (prevSibling.getItemData().position -
                  nextSibling.getItemData().position) /
                  2,
            )
          }
        }
      } else {
        // dropped into folder
        newPosition =
          typeof highestPosition !== "undefined"
            ? highestPosition + NOTE_GAP
            : NEW_NOTE_POSITION
      }

      if (newPosition) {
        moveNote.mutate({
          id: item.getId(),
          parentId: newParentId,
          position: newPosition,
        })
      }
    },
    features: [
      syncDataLoaderFeature,
      dragAndDropFeature,
      keyboardDragAndDropFeature,
      selectionFeature,
      customClickBehavior,
    ],
  })

  const [createDialogTarget, setCreateDialogTarget] =
    useState<CreateNoteDialogTarget | null>(null)
  const [deleteDialogTargetId, setDeleteDialogTargetId] = useState<
    string | null
  >(null)
  const [activePopoverId, setActivePopoverId] = useState<string | null>(null)

  const createDialogRef = useRef<CreateNoteDialogRef>(null)

  const openCreateDialog = useCallback(
    (parentId: string | null, parentName: string | null) => {
      if (!workspaceId) return
      setCreateDialogTarget({
        workspaceId,
        parentId,
        parentName,
      })
    },
    [workspaceId],
  )

  const openDeleteDialog = useCallback((noteId: string) => {
    setDeleteDialogTargetId(noteId)
  }, [])

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogTargetId(null)
  }, [])

  useEffect(() => {
    if (createDialogTarget) {
      const frame = requestAnimationFrame(() => {
        createDialogRef.current?.focusNameInput()
      })
      return () => cancelAnimationFrame(frame)
    }
    return undefined
  }, [createDialogTarget])

  const deleteDialogNote = useMemo(() => {
    if (!deleteDialogTargetId) return null
    return notesById.get(deleteDialogTargetId) ?? null
  }, [deleteDialogTargetId, notesById])

  return (
    <motion.div
      className="flex size-full flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {!workspaceId && (
        <em className="my-4 self-center text-sm text-muted-foreground">
          No workspace selected
        </em>
      )}

      {notes.isPending && !!workspaceId && (
        <div className="flex justify-center p-4">
          <Loading className="size-5 text-muted-foreground" />
        </div>
      )}

      {notes.isError && !!workspaceId && (
        <em className="my-4 self-center text-sm text-destructive">
          Error loading notes
        </em>
      )}

      {notes.isSuccess && notes.data.length === 0 && !!workspaceId && (
        <motion.div
          className="flex flex-col items-center justify-center p-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.p
            className="mb-2 text-sm text-muted-foreground"
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          >
            No notes found
          </motion.p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              variant="outline"
              onClick={() => openCreateDialog(null, null)}
            >
              Create your first note
            </Button>
          </motion.div>
        </motion.div>
      )}

      {notes.isSuccess && notes.data.length > 0 && !!workspaceId && (
        <motion.div
          className="scrollbar-thin h-full touch-pan-y overflow-x-hidden overflow-y-auto overscroll-x-none pt-6 pr-2 pl-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          {...tree.getContainerProps()}
        >
          <AssistiveTreeDescription tree={tree} />
          {tree.getItems().map((item, idx) => {
            const note = notesById.get(item.getId())
            if (!note || note.id === ROOT_ID) return null

            return (
              <motion.div
                key={item.getId()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.02 }}
              >
                <NoteTreeItem
                  item={item}
                  note={note}
                  onOpenCreate={openCreateDialog}
                  onOpenDelete={openDeleteDialog}
                  onOpenPopover={setActivePopoverId}
                  onClosePopover={() => setActivePopoverId(null)}
                  activePopoverId={activePopoverId}
                />
              </motion.div>
            )
          })}
          <motion.div
            key="create-note-button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: tree.getItems().length * 0.02 }}
          >
            <Button
              variant="ghost"
              size="xs"
              className="mt-1 w-full justify-start text-muted-foreground"
              onClick={() => openCreateDialog(null, null)}
            >
              create new note
            </Button>
          </motion.div>
          <div
            style={tree.getDragLineStyle(undefined, 12)}
            className="-mt-0.5 h-1 rounded-full bg-primary"
          />
        </motion.div>
      )}
      <CreateNoteDialog
        ref={createDialogRef}
        target={createDialogTarget}
        onClose={() => {
          setCreateDialogTarget(null)
        }}
      />
      {deleteDialogNote ? (
        <DeleteNoteDialog
          isOpen={Boolean(deleteDialogNote)}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              closeDeleteDialog()
            }
          }}
          note={deleteDialogNote}
        />
      ) : null}
    </motion.div>
  )
}
