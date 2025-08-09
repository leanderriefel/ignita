"use client"

import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { RouterInputs, RouterOutputs } from "@ignita/trpc"
import { useTRPC } from "@ignita/trpc/client"

export type Provider = RouterInputs["providers"]["getProviderKey"]["provider"]

export const useProviderKey = (provider: Provider) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const query = useQuery(
    trpc.providers.getProviderKey.queryOptions({ provider }),
  )

  const setMutation = useMutation(
    trpc.providers.setProviderKey.mutationOptions({
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.providers.getProviderKey.queryKey({ provider }),
        })
        const previous = queryClient.getQueryData<
          RouterOutputs["providers"]["getProviderKey"]
        >(trpc.providers.getProviderKey.queryKey({ provider }))
        if (!previous) return

        queryClient.setQueryData(
          trpc.providers.getProviderKey.queryKey({ provider }),
          { ...previous, apiKey: variables.apiKey },
        )
        return { previous }
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.previous) {
          queryClient.setQueryData(
            trpc.providers.getProviderKey.queryKey({ provider }),
            ctx.previous,
          )
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.providers.getProviderKey.queryKey({ provider }),
        })
      },
    }),
  )

  const deleteMutation = useMutation(
    trpc.providers.deleteProviderKey.mutationOptions({
      onMutate: async () => {
        await queryClient.cancelQueries({
          queryKey: trpc.providers.getProviderKey.queryKey({ provider }),
        })
        const previous = queryClient.getQueryData<
          RouterOutputs["providers"]["getProviderKey"]
        >(trpc.providers.getProviderKey.queryKey({ provider }))
        if (!previous) return

        queryClient.setQueryData(
          trpc.providers.getProviderKey.queryKey({ provider }),
          null,
        )
        return { previous }
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.previous) {
          queryClient.setQueryData(
            trpc.providers.getProviderKey.queryKey({ provider }),
            ctx.previous,
          )
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.providers.getProviderKey.queryKey({ provider }),
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
      setKey: (key: string) => setMutation.mutate({ provider, apiKey: key }),
      setKeyAsync: (key: string) =>
        setMutation.mutateAsync({ provider, apiKey: key }),
      isSetting: setMutation.isPending,
      removeKey: () => deleteMutation.mutate({ provider }),
      query,
    }),
    [
      apiKey,
      deleteMutation,
      provider,
      query.isFetching,
      query.isLoading,
      setMutation,
      setMutation.isPending,
    ],
  )
}
