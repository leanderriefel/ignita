"use client"

import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import type { workspaces as workspacesTable } from "@ignita/database/schema"
import { useTRPC } from "@ignita/trpc/client"

const cacheWorkspaces = (
  workspaces: (typeof workspacesTable.$inferSelect)[] | undefined,
  trpc: ReturnType<typeof useTRPC>,
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  if (!workspaces) return

  workspaces.forEach((workspace) => {
    queryClient.setQueryData(
      trpc.workspaces.getWorkspace.queryKey({ id: workspace.id }),
      workspace,
    )
  })
}

export const useWorkspaces = (options?: { enabled?: boolean }) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const query = useQuery(
    trpc.workspaces.getWorkspaces.queryOptions(undefined, options),
  )

  useEffect(() => {
    cacheWorkspaces(query.data, trpc, queryClient)
  }, [query.data])

  return query
}

export const useWorkspace = (id: string, options?: { enabled?: boolean }) => {
  const trpc = useTRPC()

  return useQuery(trpc.workspaces.getWorkspace.queryOptions({ id }, options))
}
