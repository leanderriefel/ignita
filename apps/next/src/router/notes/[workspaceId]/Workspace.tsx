import { useParams } from "react-router"

const Workspace = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>()

  return <div>Workspace: {workspaceId}</div>
}

export default Workspace
