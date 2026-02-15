"use client"

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query"

import type { RouterInputs, RouterOutputs } from "@ignita/trpc"
import { useTRPC } from "@ignita/trpc/client"

type Note = RouterOutputs["notes"]["getNote"]

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
      onMutate: async (variables, context) => {
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
              if (old?.note.type !== "board") return old

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
          await restOptions.onMutate(variables, context)
        }

        return { previousNote }
      },
      onError: (err, variables, mutation, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        if (optimistic && mutation?.previousNote) {
          queryClient.setQueryData(
            trpc.notes.getNote.queryKey({ id: variables.noteId }),
            mutation.previousNote,
          )
        }

        restOptions?.onError?.(err, variables, mutation, context)
      },
      onSettled: (data, err, variables, mutation, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        // Only invalidate if optimistic updates are disabled or there was an error
        if (!optimistic || err) {
          queryClient.invalidateQueries({
            queryKey: trpc.notes.getNote.queryKey({ id: variables.noteId }),
          })
        }

        restOptions?.onSettled?.(data, err, variables, mutation, context)
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
      onMutate: async (variables, context) => {
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
              if (old?.note.type !== "board") return old

              // Find the card to move first
              let cardToMove:
                | (typeof old.note.content.columns)[0]["cards"][0]
                | undefined = undefined
              const sourceColumn = old.note.content.columns.find(
                (col) => col.id === variables.sourceColumnId,
              )
              if (sourceColumn) {
                cardToMove = sourceColumn.cards.find(
                  (card) => card.id === variables.cardId,
                )
              }

              if (!cardToMove) return old

              // Create updated columns using the same logic as backend
              const updatedColumns = old.note.content.columns.map((column) => {
                if (
                  column.id === variables.sourceColumnId &&
                  column.id === variables.targetColumnId
                ) {
                  // Moving within the same column - reorder cards
                  const currentIndex = column.cards.findIndex(
                    (card) => card.id === variables.cardId,
                  )
                  const newCards = column.cards.filter(
                    (card) => card.id !== variables.cardId,
                  )

                  // Adjust target index if moving after the current position
                  let adjustedTargetIndex = variables.targetIndex
                  if (variables.targetIndex > currentIndex) {
                    adjustedTargetIndex = variables.targetIndex - 1
                  }

                  newCards.splice(adjustedTargetIndex, 0, cardToMove)
                  return {
                    ...column,
                    cards: newCards,
                  }
                } else if (column.id === variables.sourceColumnId) {
                  // Remove card from source column
                  return {
                    ...column,
                    cards: column.cards.filter(
                      (card) => card.id !== variables.cardId,
                    ),
                  }
                } else if (column.id === variables.targetColumnId) {
                  // Add card to target column at specified index
                  const newCards = [...column.cards]
                  newCards.splice(variables.targetIndex, 0, cardToMove)
                  return {
                    ...column,
                    cards: newCards,
                  }
                }
                return column
              })

              return {
                ...old,
                note: {
                  ...old.note,
                  content: {
                    ...old.note.content,
                    columns: updatedColumns,
                  },
                },
              }
            },
          )
        }

        if (restOptions.onMutate) {
          await restOptions.onMutate(variables, context)
        }

        return { previousNote }
      },
      onError: (err, variables, mutation, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        if (optimistic && mutation?.previousNote) {
          queryClient.setQueryData(
            trpc.notes.getNote.queryKey({ id: variables.noteId }),
            mutation.previousNote,
          )
        }

        restOptions?.onError?.(err, variables, mutation, context)
      },
      onSettled: (data, err, variables, mutation, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        // Only invalidate if optimistic updates are disabled or there was an error
        if (!optimistic || err) {
          queryClient.invalidateQueries({
            queryKey: trpc.notes.getNote.queryKey({ id: variables.noteId }),
          })
        }

        restOptions?.onSettled?.(data, err, variables, mutation, context)
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
      onMutate: async (variables, context) => {
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
              if (old?.note.type !== "board") return old

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
          await restOptions.onMutate(variables, context)
        }

        return { previousNote }
      },
      onError: (err, variables, mutation, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        if (optimistic && mutation?.previousNote) {
          queryClient.setQueryData(
            trpc.notes.getNote.queryKey({ id: variables.noteId }),
            mutation.previousNote,
          )
        }

        restOptions?.onError?.(err, variables, mutation, context)
      },
      onSettled: (data, err, variables, mutation, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        // Only invalidate if optimistic updates are disabled or there was an error
        if (!optimistic || err) {
          queryClient.invalidateQueries({
            queryKey: trpc.notes.getNote.queryKey({ id: variables.noteId }),
          })
        }

        restOptions?.onSettled?.(data, err, variables, mutation, context)
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
      onMutate: async (variables, context) => {
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
              if (old?.note.type !== "board") return old

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
          await restOptions.onMutate(variables, context)
        }

        return { previousNote }
      },
      onError: (err, variables, mutation, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        if (optimistic && mutation?.previousNote) {
          queryClient.setQueryData(
            trpc.notes.getNote.queryKey({ id: variables.noteId }),
            mutation.previousNote,
          )
        }

        restOptions?.onError?.(err, variables, mutation, context)
      },
      onSettled: (data, err, variables, mutation, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        // Only invalidate if optimistic updates are disabled or there was an error
        if (!optimistic || err) {
          queryClient.invalidateQueries({
            queryKey: trpc.notes.getNote.queryKey({ id: variables.noteId }),
          })
        }

        restOptions?.onSettled?.(data, err, variables, mutation, context)
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
      onMutate: async (variables, context) => {
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
              if (old?.note.type !== "board") return old

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
          await restOptions.onMutate(variables, context)
        }

        return { previousNote }
      },
      onError: (err, variables, mutation, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        if (optimistic && mutation?.previousNote) {
          queryClient.setQueryData(
            trpc.notes.getNote.queryKey({ id: variables.noteId }),
            mutation.previousNote,
          )
        }

        restOptions?.onError?.(err, variables, mutation, context)
      },
      onSettled: (data, err, variables, mutation, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        // Only invalidate if optimistic updates are disabled or there was an error
        if (!optimistic || err) {
          queryClient.invalidateQueries({
            queryKey: trpc.notes.getNote.queryKey({ id: variables.noteId }),
          })
        }

        restOptions?.onSettled?.(data, err, variables, mutation, context)
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
      onMutate: async (variables, context) => {
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
              if (old?.note.type !== "board") return old

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
                                id: variables.id,
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
          await restOptions.onMutate(variables, context)
        }

        return { previousNote }
      },
      onError: (err, variables, mutation, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        if (optimistic && mutation?.previousNote) {
          queryClient.setQueryData(
            trpc.notes.getNote.queryKey({ id: variables.noteId }),
            mutation.previousNote,
          )
        }

        restOptions?.onError?.(err, variables, mutation, context)
      },
      onSettled: (data, err, variables, mutation, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        // Only invalidate if optimistic updates are disabled or there was an error
        if (!optimistic || err) {
          queryClient.invalidateQueries({
            queryKey: trpc.notes.getNote.queryKey({ id: variables.noteId }),
          })
        }

        restOptions?.onSettled?.(data, err, variables, mutation, context)
      },
    }),
  )
}

export const useDeleteBoardColumn = (
  options?: Partial<
    UseMutationOptions<
      RouterOutputs["notes"]["boards"]["deleteColumn"],
      unknown,
      RouterInputs["notes"]["boards"]["deleteColumn"],
      unknown
    >
  > & { optimistic?: boolean },
) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.notes.boards.deleteColumn.mutationOptions({
      ...options,
      onMutate: async (variables, context) => {
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
              if (old?.note.type !== "board") return old

              return {
                ...old,
                note: {
                  ...old.note,
                  content: {
                    columns: old.note.content.columns.filter(
                      (col) => col.id !== variables.columnId,
                    ),
                  },
                },
              }
            },
          )
        }

        if (restOptions.onMutate) {
          await restOptions.onMutate(variables, context)
        }

        return { previousNote }
      },
      onError: (err, variables, mutation, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        if (optimistic && mutation?.previousNote) {
          queryClient.setQueryData(
            trpc.notes.getNote.queryKey({ id: variables.noteId }),
            mutation.previousNote,
          )
        }

        restOptions?.onError?.(err, variables, mutation, context)
      },
      onSettled: (data, err, variables, mutation, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        // Only invalidate if optimistic updates are disabled or there was an error
        if (!optimistic || err) {
          queryClient.invalidateQueries({
            queryKey: trpc.notes.getNote.queryKey({ id: variables.noteId }),
          })
        }

        restOptions?.onSettled?.(data, err, variables, mutation, context)
      },
    }),
  )
}

export const useUpdateBoardColumn = (
  options?: Partial<
    UseMutationOptions<
      RouterOutputs["notes"]["boards"]["updateColumn"],
      unknown,
      RouterInputs["notes"]["boards"]["updateColumn"],
      unknown
    >
  > & { optimistic?: boolean },
) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.notes.boards.updateColumn.mutationOptions({
      ...options,
      onMutate: async (variables, context) => {
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
              if (old?.note.type !== "board") return old

              return {
                ...old,
                note: {
                  ...old.note,
                  content: {
                    columns: old.note.content.columns.map((col) =>
                      col.id === variables.columnId
                        ? {
                            ...col,
                            ...(variables.title !== undefined && {
                              title: variables.title,
                            }),
                            ...(variables.color !== undefined && {
                              color: variables.color,
                            }),
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
          await restOptions.onMutate(variables, context)
        }

        return { previousNote }
      },
      onError: (err, variables, mutation, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        if (optimistic && mutation?.previousNote) {
          queryClient.setQueryData(
            trpc.notes.getNote.queryKey({ id: variables.noteId }),
            mutation.previousNote,
          )
        }

        restOptions?.onError?.(err, variables, mutation, context)
      },
      onSettled: (data, err, variables, mutation, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        // Only invalidate if optimistic updates are disabled or there was an error
        if (!optimistic || err) {
          queryClient.invalidateQueries({
            queryKey: trpc.notes.getNote.queryKey({ id: variables.noteId }),
          })
        }

        restOptions?.onSettled?.(data, err, variables, mutation, context)
      },
    }),
  )
}

export const useAddBoardColumn = (
  options?: Partial<
    UseMutationOptions<
      RouterOutputs["notes"]["boards"]["addColumn"],
      unknown,
      RouterInputs["notes"]["boards"]["addColumn"],
      unknown
    >
  > & { optimistic?: boolean },
) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.notes.boards.addColumn.mutationOptions({
      ...options,
      onMutate: async (variables, context) => {
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
              if (old?.note.type !== "board") return old

              return {
                ...old,
                note: {
                  ...old.note,
                  content: {
                    columns: [
                      ...old.note.content.columns,
                      {
                        id: variables.id,
                        title: variables.title,
                        color: variables.color ?? "#000000",
                        cards: [],
                      },
                    ],
                  },
                },
              }
            },
          )
        }

        if (restOptions.onMutate) {
          await restOptions.onMutate(variables, context)
        }

        return { previousNote }
      },
      onError: (err, variables, mutation, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        if (optimistic && mutation?.previousNote) {
          queryClient.setQueryData(
            trpc.notes.getNote.queryKey({ id: variables.noteId }),
            mutation.previousNote,
          )
        }

        restOptions?.onError?.(err, variables, mutation, context)
      },
      onSettled: (data, err, variables, mutation, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        // Only invalidate if optimistic updates are disabled or there was an error
        if (!optimistic || err) {
          queryClient.invalidateQueries({
            queryKey: trpc.notes.getNote.queryKey({ id: variables.noteId }),
          })
        }

        restOptions?.onSettled?.(data, err, variables, mutation, context)
      },
    }),
  )
}
