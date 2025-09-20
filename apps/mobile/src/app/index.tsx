import { useEffect, useMemo, useState } from "react"
import { useStore } from "@tanstack/react-store"
import { Redirect, useRouter } from "expo-router"
import {
  ChevronLeft,
  ChevronRight,
  Home as HomeIcon,
  Plus,
} from "lucide-react-native"
import { BackHandler, FlatList, Pressable, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { useNotes, useWorkspaces } from "@ignita/hooks"
import { cn, notesSessionStore, setWorkspace } from "@ignita/lib"

import { CreateNoteDialog } from "~/components/notes/create-note-dialog"
import { Button } from "~/components/ui/button"
import { Icon } from "~/components/ui/icon"
import { Loading } from "~/components/ui/loading"
import { CreateWorkspaceDialog } from "~/components/workspaces/create-workspace-dialog"
import { WorkspaceDropdown } from "~/components/workspaces/workspace-dropdown"
import { useSession } from "~/lib/auth/auth-client"

const Home = () => {
  const session = useSession()
  const { workspaceId } = useStore(notesSessionStore)

  const workspaces = useWorkspaces({ enabled: !!session.data?.user.id })

  const router = useRouter()

  useEffect(() => {
    if (!workspaceId && workspaces.data && workspaces.data.length > 0) {
      setWorkspace(workspaces.data[0].id)
    }
  }, [workspaceId, workspaces.data])

  const notes = useNotes(
    { workspaceId: workspaceId ?? "" },
    { enabled: !!workspaceId },
  )

  const [stack, setStack] = useState<string[]>([])
  useEffect(() => {
    setStack([])
  }, [workspaceId])

  useEffect(() => {
    const onBackPress = () => {
      if (stack.length > 0) {
        setStack((s) => (s.length ? s.slice(0, -1) : s))
        return true
      }
      return false
    }
    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress)
    return () => sub.remove()
  }, [stack.length])

  const currentParentId = stack.length > 0 ? stack[stack.length - 1] : null

  const { items, childCountById } = useMemo(() => {
    const all = notes.data ?? []
    const childCount = new Map<string, number>()
    for (const n of all) {
      if (n.parentId) {
        childCount.set(n.parentId, (childCount.get(n.parentId) ?? 0) + 1)
      }
    }
    const filtered = all
      .filter((n) =>
        currentParentId ? n.parentId === currentParentId : n.parentId === null,
      )
      .sort((a, b) => b.position - a.position)
    return { items: filtered, childCountById: childCount }
  }, [notes.data, currentParentId])

  const [createNoteId, setCreateNoteId] = useState<string | null | undefined>(
    undefined,
  )
  const [wsDialogOpen, setWsDialogOpen] = useState(false)

  if (session.isPending || workspaces.isPending) {
    return (
      <View className="flex-1 items-center justify-center">
        <Loading className="size-6" />
      </View>
    )
  }

  if (!session.data) {
    return <Redirect href="/auth/sign-in" />
  }

  if (workspaces.isSuccess && workspaces.data.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-6">
        <View className="items-center gap-4">
          <Text className="text-base text-muted-foreground">
            No workspaces yet
          </Text>
          <Button onPress={() => setWsDialogOpen(true)}>
            <Text>Create your first workspace</Text>
          </Button>
        </View>
        <CreateWorkspaceDialog
          open={wsDialogOpen}
          onOpenChange={setWsDialogOpen}
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-row items-center justify-between border-b border-border px-3 py-2">
        <View className="flex-row items-center gap-2">
          <Pressable
            className="rounded-md p-2"
            onPress={() => setStack((s) => (s.length ? s.slice(0, -1) : s))}
            disabled={stack.length === 0}
          >
            <Icon
              as={ChevronLeft}
              className={cn({
                "text-muted-foreground/40": stack.length === 0,
                "text-foreground": stack.length > 0,
              })}
              size={16}
            />
          </Pressable>
          <Pressable className="rounded-md p-2" onPress={() => setStack([])}>
            <Icon
              as={HomeIcon}
              className={cn({
                "text-muted-foreground/40": stack.length === 0,
                "text-foreground": stack.length > 0,
              })}
              size={16}
            />
          </Pressable>
        </View>
        <View className="flex-row items-center gap-2">
          <WorkspaceDropdown />
          <Text className="pr-2 text-base font-semibold">Notes</Text>
        </View>
      </View>

      {(!workspaceId || notes.isPending) && (
        <View className="flex-1 items-center justify-center">
          <Loading className="size-6" />
        </View>
      )}

      {notes.isError && workspaceId && (
        <View className="flex-1 items-center justify-center">
          <Text className="text-destructive">Failed to load notes</Text>
        </View>
      )}

      {workspaceId && (
        <CreateNoteDialog
          open={typeof createNoteId !== "undefined"}
          onOpenChange={(o) => {
            if (!o) setCreateNoteId(undefined)
          }}
          workspaceId={workspaceId}
          parentId={createNoteId ?? null}
        />
      )}

      {notes.isSuccess && (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerClassName="gap-y-3 m-3"
            renderItem={({ item }) => {
              const subCount = childCountById.get(item.id) ?? 0
              return (
                <View className="mb-3">
                  <View className="rounded-lg border border-border bg-background p-4">
                    <Pressable
                      onPress={() => router.navigate(`/notes/${item.id}`)}
                    >
                      <Text className="text-base font-medium text-foreground">
                        {item.name}
                      </Text>
                    </Pressable>
                  </View>
                  <Pressable
                    className="-z-10 -mt-2 flex w-full flex-row justify-between rounded-b-md border-x border-b border-border bg-muted px-3 pb-3 pt-5"
                    onPress={() => {
                      if (subCount === 0) {
                        setCreateNoteId(item.id)
                        return
                      }

                      setStack((s) => [...s, item.id])
                    }}
                  >
                    {subCount > 0 && (
                      <>
                        <Text className="text-xs text-muted-foreground">
                          {subCount} Notes inside
                        </Text>
                        <Icon
                          as={ChevronRight}
                          className="text-muted-foreground"
                          size={16}
                        />
                      </>
                    )}
                    {subCount === 0 && (
                      <>
                        <Text className="text-xs text-muted-foreground">
                          Create note inside
                        </Text>
                        <Icon
                          as={Plus}
                          className="text-muted-foreground"
                          size={16}
                        />
                      </>
                    )}
                  </Pressable>
                </View>
              )
            }}
            ListEmptyComponent={() => (
              <View className="flex-1 items-center justify-center py-16">
                <Text className="text-muted-foreground">No notes here</Text>
              </View>
            )}
            ListFooterComponent={
              <Pressable
                className="flex flex-row items-center justify-between gap-2 rounded-lg border border-border bg-muted px-4 py-2"
                onPress={() => setCreateNoteId(null)}
              >
                <Text className="text-xs text-muted-foreground">
                  Create Note
                </Text>
                <Icon as={Plus} className="text-muted-foreground" size={16} />
              </Pressable>
            }
          />
        </>
      )}
    </SafeAreaView>
  )
}

export default Home
