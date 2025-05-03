import { WithSideNav } from "@/components/SideNav"
import { TopNav } from "@/components/TopNav"
import { getQueryClient, trpc } from "@/server/trpc/caller"

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
    trpc.notes.getTopNotes.queryOptions({
      workspaceId: awaitedParams.workspaceId,
    }),
  )

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
