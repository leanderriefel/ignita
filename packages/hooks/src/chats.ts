import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { useTRPC } from "@ignita/trpc/client"

export const useChats = ({ enabled }: { enabled?: boolean } = {}) => {
  const trpc = useTRPC()

  return useInfiniteQuery(
    trpc.chats.getChats.infiniteQueryOptions(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled,
      },
    ),
  )
}

export const useChat = (
  id: string,
  { enabled }: { enabled?: boolean } = {},
) => {
  const trpc = useTRPC()

  return useQuery(trpc.chats.getChat.queryOptions({ id }, { enabled }))
}

export const useGenerateChatTitle = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.chats.generateChatTitle.mutationOptions({
      onSuccess: (data, variables) => {
        if (!data) return

        queryClient.setQueryData(
          trpc.chats.getChat.queryKey({ id: variables.chatId }),
          (oldData) => {
            if (!oldData) return oldData

            return {
              ...oldData,
              title: data.title,
            }
          },
        )

        queryClient.setQueryData(trpc.chats.getChats.queryKey(), (oldData) => {
          if (!oldData) return oldData

          return {
            ...oldData,
            items: oldData.items.map((item) => {
              if (item.id === variables.chatId) {
                return {
                  ...item,
                  title: data.title,
                }
              }

              return item
            }),
          }
        })
      },
    }),
  )
}

export const useCreateChat = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.chats.createChat.mutationOptions({
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.chats.getChats.queryKey(),
        })
      },
    }),
  )
}

export const useDeleteChat = (options?: {
  currentChatId?: string
  onCurrentChatDeleted?: () => void
}) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.chats.deleteChat.mutationOptions({
      onSettled: (data, error, variables) => {
        if (error) return // Don't update if there was an error

        // Remove the deleted chat from all infinite chat queries
        queryClient.setQueriesData(
          { queryKey: trpc.chats.getChats.infiniteQueryKey() },
          (
            oldData:
              | { pages?: Array<{ items: Array<{ id: string }> }> }
              | undefined,
          ) => {
            if (!oldData) return oldData

            if (Array.isArray(oldData.pages)) {
              // Handle infinite query data
              return {
                ...oldData,
                pages: oldData.pages.map((page) => ({
                  ...page,
                  items: page.items.filter((item) => item.id !== variables.id),
                })),
              }
            }

            return oldData
          },
        )

        // Also handle regular query data (just in case)
        queryClient.setQueriesData(
          { queryKey: trpc.chats.getChats.queryKey() },
          (oldData: { items?: Array<{ id: string }> } | undefined) => {
            if (!oldData) return oldData

            if (oldData.items) {
              return {
                ...oldData,
                items: oldData.items.filter((item) => item.id !== variables.id),
              }
            }

            return oldData
          },
        )

        if (
          options?.currentChatId === variables.id &&
          options?.onCurrentChatDeleted
        ) {
          options.onCurrentChatDeleted()
        }
      },
    }),
  )
}
