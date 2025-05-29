import { getQueryClient, trpc } from "@/lib/trpc/server"
import { WithSideNav } from "@nuotes/components/side-nav"
import { TopNav } from "@nuotes/components/top-nav"

const WorkspaceLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ workspaceId: string; noteId?: string }>
}) => {
  const awaitedParams = await params

  const queryClient = getQueryClient()
  await queryClient.prefetchQuery(
    trpc.notes.getNotesByParentId.queryOptions({
      workspaceId: awaitedParams.workspaceId,
      parentId: null,
    }),
  )

  if (awaitedParams.noteId) {
    await queryClient.prefetchQuery(
      trpc.notes.getNote.queryOptions({
        id: awaitedParams.noteId,
      }),
    )
  }

  return (
    <WithSideNav>
      <div className="grid grid-rows-[auto_1fr]">
        <TopNav />
        <div className="size-full">{children}</div>
      </div>
    </WithSideNav>
  )
}

export default WorkspaceLayout
