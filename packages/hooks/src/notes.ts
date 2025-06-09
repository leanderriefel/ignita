"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { RouterOutputs } from "@ignita/trpc"
import { useTRPC } from "@ignita/trpc/client"

type Note = RouterOutputs["notes"]["getNotes"][number]

export const useNote = (id: string, options?: { enabled?: boolean }) => {
  const trpc = useTRPC()

  return useQuery(trpc.notes.getNote.queryOptions({ id }, options))
}

export const useNotes = ({ workspaceId }: { workspaceId: string }) => {
  const trpc = useTRPC()

  return useQuery(trpc.notes.getNotes.queryOptions({ workspaceId }))
}

export const useMoveNote = ({ workspaceId }: { workspaceId: string }) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.notes.moveNote.mutationOptions({
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.notes.getNotes.queryKey({ workspaceId }),
        })

        const previousNotes = queryClient.getQueryData<Note[]>(
          trpc.notes.getNotes.queryKey({ workspaceId }),
        )

        queryClient.setQueryData<Note[] | undefined>(
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

            return notes.map((n) => {
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
          },
        )

        return { previousNotes }
      },
      onError: (err, variables, context) => {
        if (context?.previousNotes) {
          queryClient.setQueryData(
            trpc.notes.getNotes.queryKey({ workspaceId }),
            context.previousNotes,
          )
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.notes.getNotes.queryKey({ workspaceId }),
        })
      },
    }),
  )
}
