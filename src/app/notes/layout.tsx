import { auth } from "@/auth"
import { getQueryClient, trpc } from "@/server/trpc/caller"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { redirect } from "next/navigation"

const NotesLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth()
  if (!session?.user) redirect("/auth")

  const queryClient = getQueryClient()
  await queryClient.prefetchQuery(trpc.workspaces.getWorkspaces.queryOptions())

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  )
}

export default NotesLayout
