import { getQueryClient, trpc } from "@/lib/trpc/server"
import { Editor } from "@nuotes/components/editor/text/editor"

const Notes = async ({
  params,
}: {
  params: Promise<{ workspaceId: string; noteId: string }>
}) => {
  const awaitedParams = await params

  const queryClient = getQueryClient()
  await queryClient.prefetchQuery(
    trpc.notes.getNote.queryOptions({
      id: awaitedParams.noteId,
    }),
  )

  return (
    <div className="size-full">
      <Editor noteId={awaitedParams.noteId} />
    </div>
  )
}

export default Notes
