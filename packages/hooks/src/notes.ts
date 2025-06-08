"use client"

import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import type { notes as notesTable } from "@ignita/database/schema"
import { useTRPC } from "@ignita/trpc/client"

const cacheNotes = (
  notes: (typeof notesTable.$inferSelect)[] | undefined,
  trpc: ReturnType<typeof useTRPC>,
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  if (!notes) return

  notes.forEach((note) => {
    queryClient.setQueryData(trpc.notes.getNote.queryKey({ id: note.id }), note)
  })
}

export const useNote = (id: string, options?: { enabled?: boolean }) => {
  const trpc = useTRPC()

  return useQuery(trpc.notes.getNote.queryOptions({ id }, options))
}

export const useNotesByPath = (
  {
    workspaceId,
    parentPath,
  }: {
    workspaceId: string
    parentPath: string | null
  },
  options?: { enabled?: boolean },
) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const query = useQuery(
    trpc.notes.getNotesByPath.queryOptions(
      { parentPath, workspaceId },
      options,
    ),
  )

  useEffect(() => {
    cacheNotes(query.data, trpc, queryClient)
  }, [query.data])

  return query
}

export const useNoteAncestors = (
  {
    workspaceId,
    path,
  }: {
    workspaceId: string
    path: string
  },
  options?: { enabled?: boolean },
) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const query = useQuery(
    trpc.notes.getNoteAncestors.queryOptions({ workspaceId, path }, options),
  )

  useEffect(() => {
    cacheNotes(query.data, trpc, queryClient)
  }, [query.data])

  return query
}
