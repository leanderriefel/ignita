"use client"

import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { RouterOutputs } from "@ignita/trpc"
import { useTRPC } from "@ignita/trpc/client"

export const useProviderKey = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const query = useQuery(trpc.providers.getProviderKey.queryOptions())

  const setMutation = useMutation(
    trpc.providers.setProviderKey.mutationOptions({
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.providers.getProviderKey.queryKey(),
        })
        const previous = queryClient.getQueryData<
          RouterOutputs["providers"]["getProviderKey"]
        >(trpc.providers.getProviderKey.queryKey())
        if (!previous) return

        queryClient.setQueryData(trpc.providers.getProviderKey.queryKey(), {
          ...previous,
          apiKey: variables.apiKey,
        })
        return { previous }
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.previous) {
          queryClient.setQueryData(
            trpc.providers.getProviderKey.queryKey(),
            ctx.previous,
          )
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.providers.getProviderKey.queryKey(),
        })
      },
    }),
  )

  const deleteMutation = useMutation(
    trpc.providers.deleteProviderKey.mutationOptions({
      onMutate: async () => {
        await queryClient.cancelQueries({
          queryKey: trpc.providers.getProviderKey.queryKey(),
        })
        const previous = queryClient.getQueryData<
          RouterOutputs["providers"]["getProviderKey"]
        >(trpc.providers.getProviderKey.queryKey())
        if (!previous) return

        queryClient.setQueryData(trpc.providers.getProviderKey.queryKey(), null)
        return { previous }
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.previous) {
          queryClient.setQueryData(
            trpc.providers.getProviderKey.queryKey(),
            ctx.previous,
          )
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.providers.getProviderKey.queryKey(),
        })
      },
    }),
  )

  const apiKey = query.data?.apiKey ?? ""

  return useMemo(
    () => ({
      apiKey,
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      setKey: (key: string) => setMutation.mutate({ apiKey: key }),
      setKeyAsync: (key: string) => setMutation.mutateAsync({ apiKey: key }),
      isSetting: setMutation.isPending,
      removeKey: () => deleteMutation.mutate(),
      query,
    }),
    [
      apiKey,
      deleteMutation,
      query.isFetching,
      query.isLoading,
      setMutation,
      setMutation.isPending,
    ],
  )
}
