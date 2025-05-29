const WorkspacePage = async ({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) => {
  const awaitedParams = await params

  return <div>Workspace: {awaitedParams.workspaceId}</div>
}

export default WorkspacePage
