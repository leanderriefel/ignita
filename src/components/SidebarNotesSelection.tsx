"use client"

import { Button } from "@/components/ui/Button"
import { extractSlugs } from "@/lib/utils"
import { trpc } from "@/trpc/react"
import Link from "next/link"
import { useParams } from "next/navigation"

export const SidebarNotesSelection = () => {
  const slugs = extractSlugs(useParams().slug as string[])
  const query = trpc.getNotes.useQuery(
    {
      workspaceId: slugs.workspace!,
    },
    {
      enabled: !!slugs.workspace,
    },
  )

  return (
    <div className="flex flex-col gap-y-2 justify-center items-center">
      {query.isLoading && <em>Loading...</em>}
      {query.isError && (
        <em className="text-destructive">Error: {query.error.message}</em>
      )}
      {query.data && (
        <div className="flex flex-col gap-y-2 text-sm">
          {query.data.map((note) => (
            <Button key={note.id} variant="link" className="w-full" asChild>
              <Link href={`/${slugs.workspace}/${note.id}`}>{note.name}</Link>
            </Button>
          ))}
          <Button className="w-full">
            {query.data.length === 0
              ? "Create your first note"
              : "Create new note"}
          </Button>
        </div>
      )}
    </div>
  )
}
