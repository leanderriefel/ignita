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

export const useNotes = (
  { workspaceId }: { workspaceId: string },
  options?: { enabled?: boolean },
) => {
  const trpc = useTRPC()

  return useQuery(trpc.notes.getNotes.queryOptions({ workspaceId }, options))
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
      onMutate: async (variables, context) => {
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
                    position: variables.position ?? n.position,
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
                        position: variables.position ?? old.position,
                      }
                    : old,
              )

              return updatedNotes
            },
          )
        }

        if (restOptions.onMutate) {
          await restOptions.onMutate(variables, context)
        }

        return { previousNotes, previousNote }
      },
      onError: (err, variables, mutation, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        if (optimistic && mutation?.previousNotes) {
          queryClient.setQueryData(
            trpc.notes.getNotes.queryKey({ workspaceId }),
            mutation.previousNotes,
          )
        }

        if (optimistic && mutation?.previousNote) {
          queryClient.setQueryData(
            trpc.notes.getNote.queryKey({ id: variables.id }),
            mutation.previousNote,
          )
        }

        restOptions?.onError?.(err, variables, mutation, context)
      },
      onSettled: (data, err, variables, mutation, context) => {
        const { ...restOptions } = options ?? {}

        queryClient.invalidateQueries({
          queryKey: trpc.notes.getNotes.queryKey({ workspaceId }),
        })

        queryClient.invalidateQueries({
          queryKey: trpc.notes.getNote.queryKey({ id: variables.id }),
        })

        restOptions?.onSettled?.(data, err, variables, mutation, context)
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
      onMutate: async (variables, context) => {
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
          await restOptions.onMutate(variables, context)
        }

        return { previousNotes, previousNote }
      },
      onError: (err, variables, mutation, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        if (optimistic && mutation?.previousNotes) {
          queryClient.setQueryData(
            trpc.notes.getNotes.queryKey({ workspaceId }),
            mutation.previousNotes,
          )
        }

        if (optimistic && mutation?.previousNote) {
          queryClient.setQueryData(
            trpc.notes.getNote.queryKey({ id: variables.id }),
            mutation.previousNote,
          )
        }

        restOptions?.onError?.(err, variables, mutation, context)
      },
      onSettled: (data, err, variables, mutation, context) => {
        const { ...restOptions } = options ?? {}

        queryClient.invalidateQueries({
          queryKey: trpc.notes.getNotes.queryKey({ workspaceId }),
        })

        queryClient.invalidateQueries({
          queryKey: trpc.notes.getNote.queryKey({ id: variables.id }),
        })

        restOptions?.onSettled?.(data, err, variables, mutation, context)
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
      onMutate: async (variables, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        if (optimistic) {
          await queryClient.cancelQueries({
            queryKey: trpc.notes.getNotes.queryKey({
              workspaceId: variables.workspaceId,
            }),
          })
        }

        if (restOptions?.onMutate) {
          await restOptions.onMutate(variables, context)
        }
      },
      onSettled: (data, err, variables, mutation, context) => {
        const { ...restOptions } = options ?? {}

        queryClient.invalidateQueries({
          queryKey: trpc.notes.getNotes.queryKey({
            workspaceId: variables.workspaceId,
          }),
        })

        restOptions?.onSettled?.(data, err, variables, mutation, context)
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
      onMutate: async (variables, context) => {
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
          await restOptions.onMutate(variables, context)
        }

        return { previousNotes, previousNote }
      },
      onError: (err, variables, mutation, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        if (optimistic && mutation?.previousNotes) {
          queryClient.setQueryData(
            trpc.notes.getNotes.queryKey({ workspaceId }),
            mutation.previousNotes,
          )
        }

        if (optimistic && mutation?.previousNote) {
          queryClient.setQueryData(
            trpc.notes.getNote.queryKey({ id: variables.id }),
            mutation.previousNote,
          )
        }

        restOptions?.onError?.(err, variables, mutation, context)
      },
      onSettled: (data, err, variables, mutation, context) => {
        const { ...restOptions } = options ?? {}

        queryClient.invalidateQueries({
          queryKey: trpc.notes.getNotes.queryKey({ workspaceId }),
        })

        queryClient.invalidateQueries({
          queryKey: trpc.notes.getNote.queryKey({ id: variables.id }),
        })

        restOptions?.onSettled?.(data, err, variables, mutation, context)
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
      onMutate: async (variables, context) => {
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
          await restOptions.onMutate(variables, context)
        }

        return { previousNote }
      },
      onError: (err, variables, mutation, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        if (optimistic && mutation?.previousNote) {
          queryClient.setQueryData(
            trpc.notes.getNote.queryKey({ id: variables.id }),
            mutation.previousNote,
          )
        }

        restOptions?.onError?.(err, variables, mutation, context)
      },
      onSettled: (data, err, variables, mutation, context) => {
        const { ...restOptions } = options ?? {}

        queryClient.invalidateQueries({
          queryKey: trpc.notes.getNote.queryKey({ id: variables.id }),
        })

        restOptions?.onSettled?.(data, err, variables, mutation, context)
      },
    }),
  )
}
