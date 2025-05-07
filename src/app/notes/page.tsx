import { auth } from "@/auth"
import { CreateWorkspaceDialogTrigger } from "@/components/dialogs/CreateWorkspaceDialog"
import { Button } from "@/components/ui/Button"
import { db } from "@/server/db"
import { redirect } from "next/navigation"

const NoWorkspaceSelectedPage = async () => {
  const session = await auth()

  const workspace = await db.query.workspaces.findFirst({
    where: (table, { eq }) => eq(table.userId, session!.user.id),
  })

  if (workspace) {
    redirect(`/notes/${workspace.id}`)
  }

  return (
    <div className="flex h-dvh w-dvw overflow-hidden bg-border/50">
      <div className="bg-background text-card-foreground relative m-2 flex-1 overflow-x-hidden overflow-y-scroll rounded-4xl border px-6 py-2 flex justify-center items-center">
        <CreateWorkspaceDialogTrigger asChild>
          <Button variant="outline" size="lg">
            Create your first workspace
          </Button>
        </CreateWorkspaceDialogTrigger>
      </div>
    </div>
  )
}

export default NoWorkspaceSelectedPage
