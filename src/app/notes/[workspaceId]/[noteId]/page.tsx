const Notes = async ({
  params,
}: {
  params: Promise<{ workspaceId: string; noteId?: string }>
}) => {
  const awaitedParams = await params

  return (
    <div className="size-full">
      <p>Workspace: {awaitedParams.workspaceId}</p>
      <p>Note: {awaitedParams.noteId}</p>
    </div>
  )
}

export default Notes
