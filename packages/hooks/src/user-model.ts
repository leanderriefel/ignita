"use client"

import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { type RouterOutputs } from "@ignita/trpc"
import { useTRPC } from "@ignita/trpc/client"

export const useSelectedModel = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const query = useQuery(
    trpc.user.getSelectedModel.queryOptions(undefined, {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),
  )

  const setMutation = useMutation(
    trpc.user.setSelectedModel.mutationOptions({
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.user.getSelectedModel.queryKey(),
        })
        const previous = queryClient.getQueryData<
          RouterOutputs["user"]["getSelectedModel"]
        >(trpc.user.getSelectedModel.queryKey())
        if (!previous) return

        queryClient.setQueryData(trpc.user.getSelectedModel.queryKey(), {
          selectedModel: variables.selectedModel,
        })
        return { previous }
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.previous) {
          queryClient.setQueryData(
            trpc.user.getSelectedModel.queryKey(),
            ctx.previous,
          )
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.user.getSelectedModel.queryKey(),
        })
      },
    }),
  )

  const selectedModel = query.data?.selectedModel ?? "openai/gpt-5-mini"

  return useMemo(
    () => ({
      selectedModel,
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      setSelectedModel: (model: string) =>
        setMutation.mutate({ selectedModel: model }),
      setSelectedModelAsync: (model: string) =>
        setMutation.mutateAsync({ selectedModel: model }),
      isSetting: setMutation.isPending,
      error: query.error ?? setMutation.error,
      query,
      mutation: setMutation,
    }),
    [
      selectedModel,
      query.isLoading,
      query.isFetching,
      query.error,
      setMutation,
      setMutation.isPending,
      setMutation.error,
    ],
  )
}

export const usePredefinedModels = () => {
  const trpc = useTRPC()

  const query = useQuery(trpc.user.getPredefinedModels.queryOptions())

  return useMemo(
    () => ({
      models: query.data?.models,
      isLoading: query.isLoading,
      error: query.error,
    }),
    [query.data?.models, query.isLoading, query.error],
  )
}
