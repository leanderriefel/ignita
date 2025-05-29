import { Editor } from "@nuotes/components"

const Notes = async ({
  params,
}: {
  params: Promise<{ workspaceId: string; noteId: string }>
}) => {
  const awaitedParams = await params

  return (
    <div className="size-full">
      <Editor noteId={awaitedParams.noteId} />
    </div>
  )
}

export default Notes
