"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query"

import type { RouterInputs, RouterOutputs } from "@ignita/trpc"
import { useTRPC } from "@ignita/trpc/client"

type Notes = RouterOutputs["notes"]["getNotes"][number]
type Note = RouterOutputs["notes"]["getNote"]

export const useNote = (id: string, options?: { enabled?: boolean }) => {
  const trpc = useTRPC()

  return useQuery(trpc.notes.getNote.queryOptions({ id }, options))
}

export const useNotes = ({ workspaceId }: { workspaceId: string }) => {
  const trpc = useTRPC()

  return useQuery(trpc.notes.getNotes.queryOptions({ workspaceId }))
}

export const useMoveNote = (
  { workspaceId }: { workspaceId: string },
  options?: Partial<
    UseMutationOptions<
      RouterOutputs["notes"]["moveNote"],
      unknown,
      RouterInputs["notes"]["moveNote"],
      unknown
    >
  > & { optimistic?: boolean },
) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.notes.moveNote.mutationOptions({
      ...options,
      onMutate: async (variables) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        let previousNotes: Notes[] | undefined
        let previousNote: Note | undefined

        if (optimistic) {
          await queryClient.cancelQueries({
            queryKey: trpc.notes.getNotes.queryKey({ workspaceId }),
          })

          await queryClient.cancelQueries({
            queryKey: trpc.notes.getNote.queryKey({ id: variables.id }),
          })

          previousNotes = queryClient.getQueryData<Notes[]>(
            trpc.notes.getNotes.queryKey({ workspaceId }),
          )

          previousNote = queryClient.getQueryData<Note>(
            trpc.notes.getNote.queryKey({ id: variables.id }),
          )

          queryClient.setQueryData<Notes[] | undefined>(
            trpc.notes.getNotes.queryKey({ workspaceId }),
            (oldData) => {
              if (!oldData) return undefined

              const notes = oldData
              const noteToMove = notes.find((n) => n.id === variables.id)

              if (!noteToMove) return notes

              const newParent = notes.find((n) => n.id === variables.parentId)
              const newParentId = newParent ? newParent.id : null

              const updatedNotes = notes.map((n) => {
                if (n.id === noteToMove.id) {
                  return {
                    ...n,
                    parentId: newParentId,
                    position: variables.position,
                  }
                }
                return n
              })

              queryClient.setQueryData<Note | undefined>(
                trpc.notes.getNote.queryKey({ id: variables.id }),
                (old) =>
                  old
                    ? {
                        ...old,
                        parentId: variables.parentId,
                        position: variables.position,
                      }
                    : old,
              )

              return updatedNotes
            },
          )
        }

        if (restOptions.onMutate) {
          await restOptions.onMutate(variables)
        }

        return { previousNotes, previousNote }
      },
      onError: (err, variables, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        if (optimistic && context?.previousNotes) {
          queryClient.setQueryData(
            trpc.notes.getNotes.queryKey({ workspaceId }),
            context.previousNotes,
          )
        }

        if (optimistic && context?.previousNote) {
          queryClient.setQueryData(
            trpc.notes.getNote.queryKey({ id: variables.id }),
            context.previousNote,
          )
        }

        restOptions?.onError?.(err, variables, context)
      },
      onSettled: (data, err, variables, context) => {
        const { ...restOptions } = options ?? {}

        queryClient.invalidateQueries({
          queryKey: trpc.notes.getNotes.queryKey({ workspaceId }),
        })

        queryClient.invalidateQueries({
          queryKey: trpc.notes.getNote.queryKey({ id: variables.id }),
        })

        restOptions?.onSettled?.(data, err, variables, context)
      },
    }),
  )
}

export const useDeleteNote = (
  { workspaceId }: { workspaceId: string },
  options?: Partial<
    UseMutationOptions<
      RouterOutputs["notes"]["deleteNote"],
      unknown,
      RouterInputs["notes"]["deleteNote"],
      unknown
    >
  > & { optimistic?: boolean },
) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.notes.deleteNote.mutationOptions({
      ...options,
      onMutate: async (variables) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        let previousNotes: Notes[] | undefined
        let previousNote: Note | undefined

        if (optimistic) {
          await queryClient.cancelQueries({
            queryKey: trpc.notes.getNotes.queryKey({ workspaceId }),
          })

          await queryClient.cancelQueries({
            queryKey: trpc.notes.getNote.queryKey({ id: variables.id }),
          })

          previousNotes = queryClient.getQueryData<Notes[]>(
            trpc.notes.getNotes.queryKey({ workspaceId }),
          )

          previousNote = queryClient.getQueryData<Note>(
            trpc.notes.getNote.queryKey({ id: variables.id }),
          )

          queryClient.setQueryData<Notes[] | undefined>(
            trpc.notes.getNotes.queryKey({ workspaceId }),
            (oldData) => {
              if (!oldData) return undefined
              return oldData.filter((n) => n.id !== variables.id)
            },
          )

          queryClient.setQueryData<Note | undefined>(
            trpc.notes.getNote.queryKey({ id: variables.id }),
            undefined,
          )
        }

        if (restOptions.onMutate) {
          await restOptions.onMutate(variables)
        }

        return { previousNotes, previousNote }
      },
      onError: (err, variables, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        if (optimistic && context?.previousNotes) {
          queryClient.setQueryData(
            trpc.notes.getNotes.queryKey({ workspaceId }),
            context.previousNotes,
          )
        }

        if (optimistic && context?.previousNote) {
          queryClient.setQueryData(
            trpc.notes.getNote.queryKey({ id: variables.id }),
            context.previousNote,
          )
        }

        restOptions?.onError?.(err, variables, context)
      },
      onSettled: (data, err, variables, context) => {
        const { ...restOptions } = options ?? {}

        queryClient.invalidateQueries({
          queryKey: trpc.notes.getNotes.queryKey({ workspaceId }),
        })

        queryClient.invalidateQueries({
          queryKey: trpc.notes.getNote.queryKey({ id: variables.id }),
        })

        restOptions?.onSettled?.(data, err, variables, context)
      },
    }),
  )
}

export const useCreateNote = (
  options?: Partial<
    UseMutationOptions<
      RouterOutputs["notes"]["createNote"],
      unknown,
      RouterInputs["notes"]["createNote"],
      unknown
    >
  > & { optimistic?: boolean },
) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.notes.createNote.mutationOptions({
      ...options,
      onMutate: async (variables) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        if (optimistic) {
          await queryClient.cancelQueries({
            queryKey: trpc.notes.getNotes.queryKey({
              workspaceId: variables.workspaceId,
            }),
          })
        }

        if (restOptions?.onMutate) {
          await restOptions.onMutate(variables)
        }
      },
      onSettled: (data, err, variables, context) => {
        const { ...restOptions } = options ?? {}

        queryClient.invalidateQueries({
          queryKey: trpc.notes.getNotes.queryKey({
            workspaceId: variables.workspaceId,
          }),
        })

        restOptions?.onSettled?.(data, err, variables, context)
      },
    }),
  )
}

export const useUpdateNoteName = (
  { workspaceId }: { workspaceId: string },
  options?: Partial<
    UseMutationOptions<
      RouterOutputs["notes"]["updateNoteName"],
      unknown,
      RouterInputs["notes"]["updateNoteName"],
      unknown
    >
  > & { optimistic?: boolean },
) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.notes.updateNoteName.mutationOptions({
      ...options,
      onMutate: async (variables) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        let previousNotes: Notes[] | undefined
        let previousNote: Note | undefined

        if (optimistic) {
          await queryClient.cancelQueries({
            queryKey: trpc.notes.getNotes.queryKey({ workspaceId }),
          })

          await queryClient.cancelQueries({
            queryKey: trpc.notes.getNote.queryKey({ id: variables.id }),
          })

          previousNotes = queryClient.getQueryData<Notes[]>(
            trpc.notes.getNotes.queryKey({ workspaceId }),
          )

          previousNote = queryClient.getQueryData<Note>(
            trpc.notes.getNote.queryKey({ id: variables.id }),
          )

          queryClient.setQueryData<Notes[] | undefined>(
            trpc.notes.getNotes.queryKey({ workspaceId }),
            (oldData) => {
              if (!oldData) return undefined
              return oldData.map((n) =>
                n.id === variables.id ? { ...n, name: variables.name } : n,
              )
            },
          )

          queryClient.setQueryData<Note | undefined>(
            trpc.notes.getNote.queryKey({ id: variables.id }),
            (old) => (old ? { ...old, name: variables.name } : old),
          )
        }

        if (restOptions.onMutate) {
          await restOptions.onMutate(variables)
        }

        return { previousNotes, previousNote }
      },
      onError: (err, variables, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        if (optimistic && context?.previousNotes) {
          queryClient.setQueryData(
            trpc.notes.getNotes.queryKey({ workspaceId }),
            context.previousNotes,
          )
        }

        if (optimistic && context?.previousNote) {
          queryClient.setQueryData(
            trpc.notes.getNote.queryKey({ id: variables.id }),
            context.previousNote,
          )
        }

        restOptions?.onError?.(err, variables, context)
      },
      onSettled: (data, err, variables, context) => {
        const { ...restOptions } = options ?? {}

        queryClient.invalidateQueries({
          queryKey: trpc.notes.getNotes.queryKey({ workspaceId }),
        })

        queryClient.invalidateQueries({
          queryKey: trpc.notes.getNote.queryKey({ id: variables.id }),
        })

        restOptions?.onSettled?.(data, err, variables, context)
      },
    }),
  )
}

export const useUpdateNoteContent = (
  options?: Partial<
    UseMutationOptions<
      RouterOutputs["notes"]["updateNoteContent"],
      unknown,
      RouterInputs["notes"]["updateNoteContent"],
      unknown
    >
  > & { optimistic?: boolean },
) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.notes.updateNoteContent.mutationOptions({
      ...options,
      onMutate: async (variables) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        let previousNote: Note | undefined

        if (optimistic) {
          await queryClient.cancelQueries({
            queryKey: trpc.notes.getNote.queryKey({ id: variables.id }),
          })

          previousNote = queryClient.getQueryData<Note>(
            trpc.notes.getNote.queryKey({ id: variables.id }),
          )

          queryClient.setQueryData<Note | undefined>(
            trpc.notes.getNote.queryKey({ id: variables.id }),
            (old) => (old ? { ...old, note: variables.note } : old),
          )
        }

        if (restOptions.onMutate) {
          await restOptions.onMutate(variables)
        }

        return { previousNote }
      },
      onError: (err, variables, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        if (optimistic && context?.previousNote) {
          queryClient.setQueryData(
            trpc.notes.getNote.queryKey({ id: variables.id }),
            context.previousNote,
          )
        }

        restOptions?.onError?.(err, variables, context)
      },
      onSettled: (data, err, variables, context) => {
        const { ...restOptions } = options ?? {}

        queryClient.invalidateQueries({
          queryKey: trpc.notes.getNote.queryKey({ id: variables.id }),
        })

        restOptions?.onSettled?.(data, err, variables, context)
      },
    }),
  )
}

export const useDeleteBoardCard = (
  options?: Partial<
    UseMutationOptions<
      RouterOutputs["notes"]["boards"]["deleteCard"],
      unknown,
      RouterInputs["notes"]["boards"]["deleteCard"],
      unknown
    >
  > & { optimistic?: boolean },
) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.notes.boards.deleteCard.mutationOptions({
      ...options,
      onMutate: async (variables) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        let previousNote: Note | undefined

        if (optimistic) {
          await queryClient.cancelQueries({
            queryKey: trpc.notes.getNote.queryKey({ id: variables.noteId }),
          })

          previousNote = queryClient.getQueryData<Note>(
            trpc.notes.getNote.queryKey({ id: variables.noteId }),
          )

          queryClient.setQueryData<Note | undefined>(
            trpc.notes.getNote.queryKey({ id: variables.noteId }),
            (old) => {
              if (!old || old.note.type !== "board") return old

              return {
                ...old,
                note: {
                  ...old.note,
                  content: {
                    columns: old.note.content.columns.map((col) => ({
                      ...col,
                      cards: col.cards.filter((c) => c.id !== variables.cardId),
                    })),
                  },
                },
              }
            },
          )
        }

        if (restOptions.onMutate) {
          await restOptions.onMutate(variables)
        }

        return { previousNote }
      },
      onError: (err, variables, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        if (optimistic && context?.previousNote) {
          queryClient.setQueryData(
            trpc.notes.getNote.queryKey({ id: variables.noteId }),
            context.previousNote,
          )
        }

        restOptions?.onError?.(err, variables, context)
      },
      onSettled: (data, err, variables, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        // Only invalidate if optimistic updates are disabled or there was an error
        if (!optimistic || err) {
          queryClient.invalidateQueries({
            queryKey: trpc.notes.getNote.queryKey({ id: variables.noteId }),
          })
        }

        restOptions?.onSettled?.(data, err, variables, context)
      },
    }),
  )
}

export const useMoveBoardCard = (
  options?: Partial<
    UseMutationOptions<
      RouterOutputs["notes"]["boards"]["moveCard"],
      unknown,
      RouterInputs["notes"]["boards"]["moveCard"],
      unknown
    >
  > & { optimistic?: boolean },
) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.notes.boards.moveCard.mutationOptions({
      ...options,
      onMutate: async (variables) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        let previousNote: Note | undefined

        if (optimistic) {
          await queryClient.cancelQueries({
            queryKey: trpc.notes.getNote.queryKey({ id: variables.noteId }),
          })

          previousNote = queryClient.getQueryData<Note>(
            trpc.notes.getNote.queryKey({ id: variables.noteId }),
          )

          queryClient.setQueryData<Note | undefined>(
            trpc.notes.getNote.queryKey({ id: variables.noteId }),
            (old) => {
              if (!old || old.note.type !== "board") return old

              const columns = old.note.content.columns.map((c) => ({ ...c }))

              // Find source column and card
              const sourceColumnIdx = columns.findIndex((c) =>
                c.cards.some((card) => card.id === variables.cardId),
              )
              if (sourceColumnIdx === -1) return old

              const sourceColumn = columns[sourceColumnIdx]
              if (!sourceColumn) return old

              const sourceCardIdx = sourceColumn.cards.findIndex(
                (card) => card.id === variables.cardId,
              )
              const [movedCard] = sourceColumn.cards.splice(sourceCardIdx, 1)
              if (!movedCard) return old

              // Find destination column
              const destColumnIdx = columns.findIndex(
                (c) => c.id === variables.targetColumnId,
              )
              if (destColumnIdx === -1) return old
              const destColumn = columns[destColumnIdx]
              if (!destColumn) return old

              // Insert at target index
              let insertIdx = variables.targetIndex
              if (
                destColumnIdx === sourceColumnIdx &&
                insertIdx > sourceCardIdx
              ) {
                insertIdx -= 1
              }

              destColumn.cards.splice(insertIdx, 0, movedCard)

              return {
                ...old,
                note: {
                  ...old.note,
                  content: {
                    columns,
                  },
                },
              }
            },
          )
        }

        if (restOptions.onMutate) {
          await restOptions.onMutate(variables)
        }

        return { previousNote }
      },
      onError: (err, variables, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        if (optimistic && context?.previousNote) {
          queryClient.setQueryData(
            trpc.notes.getNote.queryKey({ id: variables.noteId }),
            context.previousNote,
          )
        }

        restOptions?.onError?.(err, variables, context)
      },
      onSettled: (data, err, variables, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        // Only invalidate if optimistic updates are disabled or there was an error
        if (!optimistic || err) {
          queryClient.invalidateQueries({
            queryKey: trpc.notes.getNote.queryKey({ id: variables.noteId }),
          })
        }

        restOptions?.onSettled?.(data, err, variables, context)
      },
    }),
  )
}

export const useReorderBoardColumns = (
  options?: Partial<
    UseMutationOptions<
      RouterOutputs["notes"]["boards"]["reorderColumns"],
      unknown,
      RouterInputs["notes"]["boards"]["reorderColumns"],
      unknown
    >
  > & { optimistic?: boolean },
) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.notes.boards.reorderColumns.mutationOptions({
      ...options,
      onMutate: async (variables) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        let previousNote: Note | undefined

        if (optimistic) {
          await queryClient.cancelQueries({
            queryKey: trpc.notes.getNote.queryKey({ id: variables.noteId }),
          })

          previousNote = queryClient.getQueryData<Note>(
            trpc.notes.getNote.queryKey({ id: variables.noteId }),
          )

          queryClient.setQueryData<Note | undefined>(
            trpc.notes.getNote.queryKey({ id: variables.noteId }),
            (old) => {
              if (!old || old.note.type !== "board") return old

              const columns = [...old.note.content.columns]
              const sourceIdx = variables.sourceIndex
              const targetIdx = variables.targetIndex

              // No adjustment needed - frontend already sends adjusted indices
              const [movedColumn] = columns.splice(sourceIdx, 1)
              if (!movedColumn) return old
              columns.splice(targetIdx, 0, movedColumn)

              return {
                ...old,
                note: {
                  ...old.note,
                  content: {
                    columns,
                  },
                },
              }
            },
          )
        }

        if (restOptions.onMutate) {
          await restOptions.onMutate(variables)
        }

        return { previousNote }
      },
      onError: (err, variables, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        if (optimistic && context?.previousNote) {
          queryClient.setQueryData(
            trpc.notes.getNote.queryKey({ id: variables.noteId }),
            context.previousNote,
          )
        }

        restOptions?.onError?.(err, variables, context)
      },
      onSettled: (data, err, variables, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        // Only invalidate if optimistic updates are disabled or there was an error
        if (!optimistic || err) {
          queryClient.invalidateQueries({
            queryKey: trpc.notes.getNote.queryKey({ id: variables.noteId }),
          })
        }

        restOptions?.onSettled?.(data, err, variables, context)
      },
    }),
  )
}

export const useUpdateBoardCardTitle = (
  options?: Partial<
    UseMutationOptions<
      RouterOutputs["notes"]["boards"]["updateCardTitle"],
      unknown,
      RouterInputs["notes"]["boards"]["updateCardTitle"],
      unknown
    >
  > & { optimistic?: boolean },
) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.notes.boards.updateCardTitle.mutationOptions({
      ...options,
      onMutate: async (variables) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        let previousNote: Note | undefined

        if (optimistic) {
          await queryClient.cancelQueries({
            queryKey: trpc.notes.getNote.queryKey({ id: variables.noteId }),
          })

          previousNote = queryClient.getQueryData<Note>(
            trpc.notes.getNote.queryKey({ id: variables.noteId }),
          )

          queryClient.setQueryData<Note | undefined>(
            trpc.notes.getNote.queryKey({ id: variables.noteId }),
            (old) => {
              if (!old || old.note.type !== "board") return old

              return {
                ...old,
                note: {
                  ...old.note,
                  content: {
                    columns: old.note.content.columns.map((col) => ({
                      ...col,
                      cards: col.cards.map((card) =>
                        card.id === variables.cardId
                          ? { ...card, title: variables.title }
                          : card,
                      ),
                    })),
                  },
                },
              }
            },
          )
        }

        if (restOptions.onMutate) {
          await restOptions.onMutate(variables)
        }

        return { previousNote }
      },
      onError: (err, variables, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        if (optimistic && context?.previousNote) {
          queryClient.setQueryData(
            trpc.notes.getNote.queryKey({ id: variables.noteId }),
            context.previousNote,
          )
        }

        restOptions?.onError?.(err, variables, context)
      },
      onSettled: (data, err, variables, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        // Only invalidate if optimistic updates are disabled or there was an error
        if (!optimistic || err) {
          queryClient.invalidateQueries({
            queryKey: trpc.notes.getNote.queryKey({ id: variables.noteId }),
          })
        }

        restOptions?.onSettled?.(data, err, variables, context)
      },
    }),
  )
}

export const useUpdateBoardCardContent = (
  options?: Partial<
    UseMutationOptions<
      RouterOutputs["notes"]["boards"]["updateCardContent"],
      unknown,
      RouterInputs["notes"]["boards"]["updateCardContent"],
      unknown
    >
  > & { optimistic?: boolean },
) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.notes.boards.updateCardContent.mutationOptions({
      ...options,
      onMutate: async (variables) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        let previousNote: Note | undefined

        if (optimistic) {
          await queryClient.cancelQueries({
            queryKey: trpc.notes.getNote.queryKey({ id: variables.noteId }),
          })

          previousNote = queryClient.getQueryData<Note>(
            trpc.notes.getNote.queryKey({ id: variables.noteId }),
          )

          queryClient.setQueryData<Note | undefined>(
            trpc.notes.getNote.queryKey({ id: variables.noteId }),
            (old) => {
              if (!old || old.note.type !== "board") return old

              return {
                ...old,
                note: {
                  ...old.note,
                  content: {
                    columns: old.note.content.columns.map((col) => ({
                      ...col,
                      cards: col.cards.map((card) =>
                        card.id === variables.cardId
                          ? { ...card, content: variables.content }
                          : card,
                      ),
                    })),
                  },
                },
              }
            },
          )
        }

        if (restOptions.onMutate) {
          await restOptions.onMutate(variables)
        }

        return { previousNote }
      },
      onError: (err, variables, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        if (optimistic && context?.previousNote) {
          queryClient.setQueryData(
            trpc.notes.getNote.queryKey({ id: variables.noteId }),
            context.previousNote,
          )
        }

        restOptions?.onError?.(err, variables, context)
      },
      onSettled: (data, err, variables, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        // Only invalidate if optimistic updates are disabled or there was an error
        if (!optimistic || err) {
          queryClient.invalidateQueries({
            queryKey: trpc.notes.getNote.queryKey({ id: variables.noteId }),
          })
        }

        restOptions?.onSettled?.(data, err, variables, context)
      },
    }),
  )
}

export const useAddBoardCard = (
  options?: Partial<
    UseMutationOptions<
      RouterOutputs["notes"]["boards"]["addCard"],
      unknown,
      RouterInputs["notes"]["boards"]["addCard"],
      unknown
    >
  > & { optimistic?: boolean },
) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.notes.boards.addCard.mutationOptions({
      ...options,
      onMutate: async (variables) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        let previousNote: Note | undefined

        if (optimistic) {
          await queryClient.cancelQueries({
            queryKey: trpc.notes.getNote.queryKey({ id: variables.noteId }),
          })

          previousNote = queryClient.getQueryData<Note>(
            trpc.notes.getNote.queryKey({ id: variables.noteId }),
          )

          queryClient.setQueryData<Note | undefined>(
            trpc.notes.getNote.queryKey({ id: variables.noteId }),
            (old) => {
              if (!old || old.note.type !== "board") return old

              return {
                ...old,
                note: {
                  ...old.note,
                  content: {
                    columns: old.note.content.columns.map((col) =>
                      col.id === variables.columnId
                        ? {
                            ...col,
                            cards: [
                              ...col.cards,
                              {
                                id: crypto.randomUUID(),
                                title: variables.title,
                                content: variables.content ?? "",
                                tags: [],
                              },
                            ],
                          }
                        : col,
                    ),
                  },
                },
              }
            },
          )
        }

        if (restOptions.onMutate) {
          await restOptions.onMutate(variables)
        }

        return { previousNote }
      },
      onError: (err, variables, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        if (optimistic && context?.previousNote) {
          queryClient.setQueryData(
            trpc.notes.getNote.queryKey({ id: variables.noteId }),
            context.previousNote,
          )
        }

        restOptions?.onError?.(err, variables, context)
      },
      onSettled: (data, err, variables, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        // Only invalidate if optimistic updates are disabled or there was an error
        if (!optimistic || err) {
          queryClient.invalidateQueries({
            queryKey: trpc.notes.getNote.queryKey({ id: variables.noteId }),
          })
        }

        restOptions?.onSettled?.(data, err, variables, context)
      },
    }),
  )
}

