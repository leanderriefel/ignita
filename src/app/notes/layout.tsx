import { auth } from "@/auth"
import { getQueryClient, trpc } from "@/server/trpc/caller"
import { redirect } from "next/navigation"

const NotesLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth()
  if (!session?.user) redirect("/auth")

  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(trpc.workspaces.getWorkspaces.queryOptions())

  return children
}

export default NotesLayout
