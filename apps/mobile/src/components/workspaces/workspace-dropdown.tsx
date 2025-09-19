import { useMemo, useState } from "react"
import { useStore } from "@tanstack/react-store"
import { Check, ChevronDown, Plus } from "lucide-react-native"
import { Pressable, Text, View } from "react-native"

import { useWorkspaces } from "@ignita/hooks"
import { notesSessionStore, setWorkspace } from "@ignita/lib"

import { Button } from "~/components/ui/button"
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
import { CreateWorkspaceDialog } from "~/components/workspaces/create-workspace-dialog"
import { THEME } from "~/lib/theme"

export const WorkspaceDropdown = () => {
  const { workspaceId } = useStore(notesSessionStore)
  const workspaces = useWorkspaces()
  const [openCreate, setOpenCreate] = useState(false)

  const currentName = useMemo(() => {
    if (!workspaces.data) return "Workspaces"
    return (
      workspaces.data.find((w) => w.id === workspaceId)?.name ?? "Workspaces"
    )
  }, [workspaces.data, workspaceId])

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Pressable
            className="flex-row items-center gap-2 rounded-md border border-border px-3 py-1.5"
            hitSlop={8}
          >
            <Text className="text-sm text-foreground">{currentName}</Text>
            <Icon
              as={ChevronDown}
              size={14}
              className="text-muted-foreground"
            />
          </Pressable>
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={6} className="min-w-[14rem] p-1">
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {workspaces.isPending && (
            <View className="px-2 py-3">
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
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-foreground">{w.name}</Text>
                  {workspaceId === w.id ? (
                    <Icon
                      as={Check}
                      size={16}
                      className="ml-2 mt-0.5 text-primary"
                    />
                  ) : null}
                </View>
              </DropdownMenuItem>
            ))}
          {workspaces.isSuccess && workspaces.data.length === 0 && (
            <View className="px-2 py-3">
              <Text className="text-sm text-muted-foreground">
                No workspaces
              </Text>
            </View>
          )}
          {workspaces.isSuccess && (
            <>
              <DropdownMenuSeparator />
              <View className="px-2 pb-1 pt-2">
                <Button
                  size="sm"
                  className="w-full"
                  onPress={() => setOpenCreate(true)}
                >
                  <Icon
                    as={Plus}
                    size={16}
                    fill={THEME.light.primaryForeground}
                  />
                  <Text className="text-sm text-foreground">
                    Create workspace
                  </Text>
                </Button>
              </View>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateWorkspaceDialog open={openCreate} onOpenChange={setOpenCreate} />
    </>
  )
}
