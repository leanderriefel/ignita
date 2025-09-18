import { useMemo } from "react"
import { useStore } from "@tanstack/react-store"
import { ChevronDown } from "lucide-react-native"
import { Pressable, Text, View } from "react-native"

import { useWorkspaces } from "@ignita/hooks"
import { notesSessionStore, setWorkspace } from "@ignita/lib"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Icon } from "~/components/ui/icon"
import { Loading } from "~/components/ui/loading"

export const WorkspaceDropdown = () => {
  const { workspaceId } = useStore(notesSessionStore)
  const workspaces = useWorkspaces()

  const currentName = useMemo(() => {
    if (!workspaces.data) return "Workspaces"
    return (
      workspaces.data.find((w) => w.id === workspaceId)?.name ?? "Workspaces"
    )
  }, [workspaces.data, workspaceId])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Pressable
          className="flex-row items-center gap-2 rounded-md border border-border px-3 py-1.5"
          hitSlop={8}
        >
          <Text className="text-sm text-foreground">{currentName}</Text>
          <Icon as={ChevronDown} size={14} className="text-muted-foreground" />
        </Pressable>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={6} className="min-w-[12rem]">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.isPending && (
          <View className="px-2 py-2">
            <Loading className="size-4 text-muted-foreground" />
          </View>
        )}
        {workspaces.isSuccess &&
          workspaces.data.map((w) => (
            <DropdownMenuItem
              key={w.id}
              onSelect={() => {
                if (workspaceId === w.id) return
                setWorkspace(w.id)
              }}
            >
              <Text className="text-sm text-foreground">{w.name}</Text>
            </DropdownMenuItem>
          ))}
        {workspaces.isSuccess && workspaces.data.length === 0 && (
          <View className="px-2 py-2">
            <Text className="text-sm text-muted-foreground">No workspaces</Text>
          </View>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
