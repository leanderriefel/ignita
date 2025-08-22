import { useCallback, useEffect, useRef, useState } from "react"
import type { useChat } from "@ai-sdk/react"
import { useStore } from "@tanstack/react-store"
import { ChevronDown, PlusIcon, Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
  useChats,
  useDeleteChat,
  useChat as useIgnitaChat,
} from "@ignita/hooks"

import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Loading } from "../ui/loading"
import { currentChatStore } from "./chat"

export const ChatDropdown = ({
  chat,
}: {
  chat: ReturnType<typeof useChat>
}) => {
  const query = useChats()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null)
  const currentChatId = useStore(currentChatStore)

  const deleteChat = useDeleteChat({
    currentChatId: currentChatId ?? undefined,
    onCurrentChatDeleted: () => {
      currentChatStore.setState(null)
      chat.setMessages([])
    },
  })

  const chats = query.data?.pages.flatMap((page) => page.items) ?? []

  const handleScroll = useCallback(() => {
    if (
      !dropdownRef.current ||
      !query.hasNextPage ||
      query.isFetchingNextPage
    ) {
      return
    }

    const { scrollTop, scrollHeight, clientHeight } = dropdownRef.current
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50 // 50px threshold

    if (isNearBottom) {
      query.fetchNextPage()
    }
  }, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage])

  useEffect(() => {
    const dropdown = dropdownRef.current
    if (dropdown) {
      dropdown.addEventListener("scroll", handleScroll)
      return () => dropdown.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll])

  const handleNewChat = () => {
    currentChatStore.setState(null)
    chat.setMessages([])
    toast.success("Created a new empty chat")
  }

  const handleSelectChat = (chatId: string) => {
    currentChatStore.setState(chatId)
    chat.setMessages([])
  }

  const handleDeleteChat = async (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent dropdown from closing
    setDeletingChatId(chatId)

    try {
      await deleteChat.mutateAsync({ id: chatId })

      // Show appropriate success message
      if (currentChatId === chatId) {
        toast.success("Chat deleted successfully - chat cleared")
      } else {
        toast.success("Chat deleted successfully")
      }
    } catch {
      toast.error("Failed to delete chat")
    } finally {
      setDeletingChatId(null)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const currentChat = useIgnitaChat(currentChatId!, {
    enabled: !!currentChatId,
  })

  return (
    <div className="flex gap-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
            role="button"
            className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border bg-background shadow-xs transition-colors hover:bg-border"
          >
            <ChevronDown className="size-4" />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          ref={dropdownRef}
          className="max-h-80 w-64 divide-y overflow-y-auto p-0"
          side="bottom"
          align="start"
        >
          {query.isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loading className="size-6" />
            </div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No chats found
            </div>
          ) : (
            <>
              {chats.map((chat) => (
                <DropdownMenuItem
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  className="group cursor-pointer rounded-none px-4 py-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                    <div className="flex min-w-0 flex-1 flex-col gap-1 overflow-hidden text-xs font-medium text-ellipsis whitespace-nowrap">
                      {chat.title ?? "Untitled Chat"}
                    </div>
                    <Button
                      size="xs"
                      variant="ghost"
                      className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      disabled={deletingChatId === chat.id}
                    >
                      {deletingChatId === chat.id ? (
                        <Loading className="size-3" />
                      ) : (
                        <Trash2 className="size-3" />
                      )}
                    </Button>
                  </div>
                </DropdownMenuItem>
              ))}

              {query.isFetchingNextPage && (
                <div className="flex items-center justify-center gap-2 border-t p-3">
                  <Loading className="size-4" />
                  <span className="text-xs text-muted-foreground">
                    Loading more chats...
                  </span>
                </div>
              )}

              {query.hasNextPage === false &&
                chats.length > 0 &&
                !query.isFetchingNextPage && (
                  <div className="flex items-center justify-center p-2">
                    <span className="text-xs text-muted-foreground">
                      No more chats to load
                    </span>
                  </div>
                )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex h-12 w-full grow cursor-pointer items-center justify-center gap-x-2 rounded-xl border bg-background text-sm shadow-xs transition-colors hover:bg-border">
        {!currentChatId && <p>No chat selected</p>}
        {currentChat.status === "pending" && !!currentChatId && (
          <p>Loading title ...</p>
        )}
        {currentChat.status === "error" && !!currentChatId && (
          <p className="text-destructive">Failed to load chat</p>
        )}
        {currentChat.status === "success" && !!currentChatId && (
          <p>{currentChat.data.title ?? "Loading title..."}</p>
        )}
      </div>

      <Button
        size="square"
        variant="outline"
        className="size-12 rounded-xl"
        onClick={handleNewChat}
      >
        <PlusIcon className="size-4" />
      </Button>
    </div>
  )
}
