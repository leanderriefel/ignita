import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/DropdownMenu"
import { extractSlugs } from "../lib/utils"
import { CaretDownIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/Button"
import { getWorkspaces } from "@/server/actions/workspaces"
import { CreateWorkspaceDialogTrigger } from "@/components/CreateWorkspaceDialog"

export const WorkspaceDropdown = async ({ params }: { params?: string[] }) => {
  const slugs = extractSlugs(params)
  const workspaces = await getWorkspaces()

  if (workspaces.length === 0) {
    return (
      <CreateWorkspaceDialogTrigger>
        <Button variant="link" className="text-card-foreground mb-1">
          Create your first workspace
        </Button>
      </CreateWorkspaceDialogTrigger>
    )
  }

  const currentWorkspace = workspaces.find((ws) => ws.id === slugs.workspace)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="link" className="text-card-foreground">
          {slugs.workspace}
          <CaretDownIcon />
        </Button>
      </DropdownMenuTrigger>
    </DropdownMenu>
  )
}
