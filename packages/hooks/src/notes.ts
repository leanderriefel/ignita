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
  >,
) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.notes.moveNote.mutationOptions({
      ...options,
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.notes.getNotes.queryKey({ workspaceId }),
        })

        await queryClient.cancelQueries({
          queryKey: trpc.notes.getNote.queryKey({ id: variables.id }),
        })

        const previousNotes = queryClient.getQueryData<Notes[]>(
          trpc.notes.getNotes.queryKey({ workspaceId }),
        )

        const previousNote = queryClient.getQueryData<Note>(
          trpc.notes.getNote.queryKey({ id: variables.id }),
        )

        queryClient.setQueryData<Notes[] | undefined>(
          trpc.notes.getNotes.queryKey({ workspaceId }),
          (oldData) => {
            if (!oldData) return undefined

            const notes = oldData
            const noteToMove = notes.find((n) => n.id === variables.id)

            if (!noteToMove) return notes

            const oldPath = noteToMove.path
            const newParent = notes.find((n) => n.id === variables.parentPath)
            const newParentPath = newParent ? newParent.path : null
            const newPath = newParentPath
              ? `${newParentPath}.${noteToMove.id}`
              : noteToMove.id

            const updatedNotes = notes.map((n) => {
              if (n.id === noteToMove.id) {
                return {
                  ...n,
                  path: newPath,
                  parentId: variables.parentPath ?? null,
                }
              }
              if (n.path.startsWith(`${oldPath}.`)) {
                const remainingPath = n.path.substring(oldPath.length)
                return { ...n, path: `${newPath}${remainingPath}` }
              }
              return n
            })

            queryClient.setQueryData<Note | undefined>(
              trpc.notes.getNote.queryKey({ id: variables.id }),
              (old) =>
                old
                  ? {
                      ...old,
                      path: newPath,
                      parentId: variables.parentPath ?? null,
                    }
                  : old,
            )

            return updatedNotes
          },
        )

        if (options?.onMutate) {
          await options.onMutate(variables)
        }

        return { previousNotes, previousNote }
      },
      onError: (err, variables, context) => {
        if (context?.previousNotes) {
          queryClient.setQueryData(
            trpc.notes.getNotes.queryKey({ workspaceId }),
            context.previousNotes,
          )
        }

        if (context?.previousNote) {
          queryClient.setQueryData(
            trpc.notes.getNote.queryKey({ id: variables.id }),
            context.previousNote,
          )
        }

        options?.onError?.(err, variables, context)
      },
      onSettled: (data, err, variables, context) => {
        queryClient.invalidateQueries({
          queryKey: trpc.notes.getNotes.queryKey({ workspaceId }),
        })

        queryClient.invalidateQueries({
          queryKey: trpc.notes.getNote.queryKey({ id: variables.id }),
        })

        options?.onSettled?.(data, err, variables, context)
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
  >,
) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.notes.deleteNote.mutationOptions({
      ...options,
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.notes.getNotes.queryKey({ workspaceId }),
        })

        await queryClient.cancelQueries({
          queryKey: trpc.notes.getNote.queryKey({ id: variables.id }),
        })

        const previousNotes = queryClient.getQueryData<Notes[]>(
          trpc.notes.getNotes.queryKey({ workspaceId }),
        )

        const previousNote = queryClient.getQueryData<Note>(
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

        if (options?.onMutate) {
          await options.onMutate(variables)
        }

        return { previousNotes, previousNote }
      },
      onError: (err, variables, context) => {
        if (context?.previousNotes) {
          queryClient.setQueryData(
            trpc.notes.getNotes.queryKey({ workspaceId }),
            context.previousNotes,
          )
        }

        if (context?.previousNote) {
          queryClient.setQueryData(
            trpc.notes.getNote.queryKey({ id: variables.id }),
            context.previousNote,
          )
        }

        options?.onError?.(err, variables, context)
      },
      onSettled: (data, err, variables, context) => {
        queryClient.invalidateQueries({
          queryKey: trpc.notes.getNotes.queryKey({ workspaceId }),
        })

        queryClient.invalidateQueries({
          queryKey: trpc.notes.getNote.queryKey({ id: variables.id }),
        })

        options?.onSettled?.(data, err, variables, context)
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
  >,
) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.notes.createNote.mutationOptions({
      ...options,
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.notes.getNotes.queryKey({
            workspaceId: variables.workspaceId,
          }),
        })

        await options?.onMutate?.(variables)
      },
      onSettled: (data, err, variables, context) => {
        queryClient.invalidateQueries({
          queryKey: trpc.notes.getNotes.queryKey({
            workspaceId: variables.workspaceId,
          }),
        })

        options?.onSettled?.(data, err, variables, context)
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
  >,
) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.notes.updateNoteName.mutationOptions({
      ...options,
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.notes.getNotes.queryKey({ workspaceId }),
        })

        await queryClient.cancelQueries({
          queryKey: trpc.notes.getNote.queryKey({ id: variables.id }),
        })

        const previousNotes = queryClient.getQueryData<Notes[]>(
          trpc.notes.getNotes.queryKey({ workspaceId }),
        )

        const previousNote = queryClient.getQueryData<Note>(
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

        if (options?.onMutate) {
          await options.onMutate(variables)
        }

        return { previousNotes, previousNote }
      },
      onError: (err, variables, context) => {
        if (context?.previousNotes) {
          queryClient.setQueryData(
            trpc.notes.getNotes.queryKey({ workspaceId }),
            context.previousNotes,
          )
        }

        if (context?.previousNote) {
          queryClient.setQueryData(
            trpc.notes.getNote.queryKey({ id: variables.id }),
            context.previousNote,
          )
        }

        options?.onError?.(err, variables, context)
      },
      onSettled: (data, err, variables, context) => {
        queryClient.invalidateQueries({
          queryKey: trpc.notes.getNotes.queryKey({ workspaceId }),
        })

        queryClient.invalidateQueries({
          queryKey: trpc.notes.getNote.queryKey({ id: variables.id }),
        })

        options?.onSettled?.(data, err, variables, context)
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
  >,
) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.notes.updateNoteContent.mutationOptions({
      ...options,
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.notes.getNote.queryKey({ id: variables.id }),
        })

        const previousNote = queryClient.getQueryData<Note>(
          trpc.notes.getNote.queryKey({ id: variables.id }),
        )

        queryClient.setQueryData<Note | undefined>(
          trpc.notes.getNote.queryKey({ id: variables.id }),
          (old) => (old ? { ...old, note: variables.note } : old),
        )

        if (options?.onMutate) {
          await options.onMutate(variables)
        }

        return { previousNote }
      },
      onError: (err, variables, context) => {
        if (context?.previousNote) {
          queryClient.setQueryData(
            trpc.notes.getNote.queryKey({ id: variables.id }),
            context.previousNote,
          )
        }

        options?.onError?.(err, variables, context)
      },
      onSettled: (data, err, variables, context) => {
        queryClient.invalidateQueries({
          queryKey: trpc.notes.getNote.queryKey({ id: variables.id }),
        })

        options?.onSettled?.(data, err, variables, context)
      },
    }),
  )
}
