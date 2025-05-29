import { getQueryClient, trpc } from "@/lib/trpc/server"
import { auth } from "@nuotes/auth"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

const NotesLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/auth")

  const queryClient = getQueryClient()
  await queryClient.prefetchQuery(trpc.workspaces.getWorkspaces.queryOptions())

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  )
}

export default NotesLayout
