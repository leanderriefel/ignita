"use client"

import { useEffect } from "react"
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query"

import type { workspaces as workspacesTable } from "@ignita/database/schema"
import type { RouterInputs, RouterOutputs } from "@ignita/trpc"
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

type Workspaces = (typeof workspacesTable.$inferSelect)[]

export const useCreateWorkspace = (
  options?: Partial<
    UseMutationOptions<
      RouterOutputs["workspaces"]["createWorkspace"],
      unknown,
      RouterInputs["workspaces"]["createWorkspace"],
      unknown
    >
  > & { optimistic?: boolean },
) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.workspaces.createWorkspace.mutationOptions({
      ...options,
      onMutate: async (variables) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        if (optimistic) {
          await queryClient.cancelQueries({
            queryKey: trpc.workspaces.getWorkspaces.queryKey(),
          })
        }

        if (restOptions.onMutate) {
          await restOptions.onMutate(variables)
        }
      },
      onSettled: (data, err, variables, context) => {
        const { ...restOptions } = options ?? {}

        queryClient.invalidateQueries({
          queryKey: trpc.workspaces.getWorkspaces.queryKey(),
        })

        restOptions?.onSettled?.(data, err, variables, context)
      },
    }),
  )
}

export const useUpdateWorkspace = (
  options?: Partial<
    UseMutationOptions<
      RouterOutputs["workspaces"]["updateWorkspace"],
      unknown,
      RouterInputs["workspaces"]["updateWorkspace"],
      unknown
    >
  > & { optimistic?: boolean },
) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.workspaces.updateWorkspace.mutationOptions({
      ...options,
      onMutate: async (variables) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        let previousWorkspaces: Workspaces | undefined
        let previousWorkspace: typeof workspacesTable.$inferSelect | undefined

        if (optimistic) {
          await queryClient.cancelQueries({
            queryKey: trpc.workspaces.getWorkspaces.queryKey(),
          })

          await queryClient.cancelQueries({
            queryKey: trpc.workspaces.getWorkspace.queryKey({
              id: variables.id,
            }),
          })

          previousWorkspaces = queryClient.getQueryData<Workspaces>(
            trpc.workspaces.getWorkspaces.queryKey(),
          )

          previousWorkspace = queryClient.getQueryData<
            typeof workspacesTable.$inferSelect
          >(trpc.workspaces.getWorkspace.queryKey({ id: variables.id }))

          queryClient.setQueryData<Workspaces | undefined>(
            trpc.workspaces.getWorkspaces.queryKey(),
            (oldData) => {
              if (!oldData) return undefined
              return oldData.map((w) =>
                w.id === variables.id ? { ...w, name: variables.name } : w,
              )
            },
          )

          queryClient.setQueryData<
            typeof workspacesTable.$inferSelect | undefined
          >(
            trpc.workspaces.getWorkspace.queryKey({ id: variables.id }),
            (old) => (old ? { ...old, name: variables.name } : old),
          )
        }

        if (restOptions.onMutate) {
          await restOptions.onMutate(variables)
        }

        return { previousWorkspaces, previousWorkspace }
      },
      onError: (err, variables, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        if (optimistic && context?.previousWorkspaces) {
          queryClient.setQueryData(
            trpc.workspaces.getWorkspaces.queryKey(),
            context.previousWorkspaces,
          )
        }

        if (optimistic && context?.previousWorkspace) {
          queryClient.setQueryData(
            trpc.workspaces.getWorkspace.queryKey({ id: variables.id }),
            context.previousWorkspace,
          )
        }

        restOptions?.onError?.(err, variables, context)
      },
      onSettled: (data, err, variables, context) => {
        const { ...restOptions } = options ?? {}

        queryClient.invalidateQueries({
          queryKey: trpc.workspaces.getWorkspaces.queryKey(),
        })

        queryClient.invalidateQueries({
          queryKey: trpc.workspaces.getWorkspace.queryKey({
            id: variables.id,
          }),
        })

        restOptions?.onSettled?.(data, err, variables, context)
      },
    }),
  )
}

export const useDeleteWorkspace = (
  options?: Partial<
    UseMutationOptions<
      RouterOutputs["workspaces"]["deleteWorkspace"],
      unknown,
      RouterInputs["workspaces"]["deleteWorkspace"],
      unknown
    >
  > & { optimistic?: boolean },
) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.workspaces.deleteWorkspace.mutationOptions({
      ...options,
      onMutate: async (variables) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        let previousWorkspaces: Workspaces | undefined
        let previousWorkspace: typeof workspacesTable.$inferSelect | undefined

        if (optimistic) {
          await queryClient.cancelQueries({
            queryKey: trpc.workspaces.getWorkspaces.queryKey(),
          })

          await queryClient.cancelQueries({
            queryKey: trpc.workspaces.getWorkspace.queryKey({
              id: variables.id,
            }),
          })

          previousWorkspaces = queryClient.getQueryData<Workspaces>(
            trpc.workspaces.getWorkspaces.queryKey(),
          )

          previousWorkspace = queryClient.getQueryData<
            typeof workspacesTable.$inferSelect
          >(trpc.workspaces.getWorkspace.queryKey({ id: variables.id }))

          queryClient.setQueryData<Workspaces | undefined>(
            trpc.workspaces.getWorkspaces.queryKey(),
            (oldData) => {
              if (!oldData) return undefined
              return oldData.filter((w) => w.id !== variables.id)
            },
          )

          queryClient.setQueryData<
            typeof workspacesTable.$inferSelect | undefined
          >(
            trpc.workspaces.getWorkspace.queryKey({ id: variables.id }),
            undefined,
          )
        }

        if (restOptions.onMutate) {
          await restOptions.onMutate(variables)
        }

        return { previousWorkspaces, previousWorkspace }
      },
      onError: (err, variables, context) => {
        const { optimistic = true, ...restOptions } = options ?? {}

        if (optimistic && context?.previousWorkspaces) {
          queryClient.setQueryData(
            trpc.workspaces.getWorkspaces.queryKey(),
            context.previousWorkspaces,
          )
        }

        if (optimistic && context?.previousWorkspace) {
          queryClient.setQueryData(
            trpc.workspaces.getWorkspace.queryKey({ id: variables.id }),
            context.previousWorkspace,
          )
        }

        restOptions?.onError?.(err, variables, context)
      },
      onSettled: (data, err, variables, context) => {
        const { ...restOptions } = options ?? {}

        queryClient.invalidateQueries({
          queryKey: trpc.workspaces.getWorkspaces.queryKey(),
        })

        queryClient.invalidateQueries({
          queryKey: trpc.workspaces.getWorkspace.queryKey({
            id: variables.id,
          }),
        })

        restOptions?.onSettled?.(data, err, variables, context)
      },
    }),
  )
}
