 
"use client"

import { CreateNoteDialogTrigger } from "@/components/dialogs/CreateNoteDialog"
import { Button } from "@/components/ui/Button"
import { useTRPC } from "@/lib/trpc"
import { extractSlugs } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useParams } from "next/navigation"

export const SidebarNotesSelection = () => {
  const slugs = extractSlugs(useParams().slug as string[])

  const trpc = useTRPC()

  const query = useQuery(
    trpc.notes.getNotes.queryOptions(
      { workspaceId: slugs.workspace! },
      { enabled: !!slugs.workspace },
    ),
  )

  return (
    <div className="flex flex-col gap-y-2 justify-center items-center">
      {!slugs.workspace && (
        <em className="text-destructive">No workspace selected</em>
      )}
      {query.isLoading && <em>Loading...</em>}
      {query.isError && (
        <em className="text-destructive">Error: {query.error.message}</em>
      )}
      {query.data && (
        <div className="flex flex-col gap-y-2 text-sm">
          {query.data.map((note) => (
            <Button key={note.id} variant="link" className="w-full" asChild>
              <Link href={`/${slugs.workspace}/${note.id}`} prefetch>
                {note.name}
              </Link>
            </Button>
          ))}
          <CreateNoteDialogTrigger workspaceId={slugs.workspace!} asChild>
            <Button className="w-full">
              {query.data.length === 0
                ? "Create your first note"
                : "Create new note"}
            </Button>
          </CreateNoteDialogTrigger>
        </div>
      )}
    </div>
  )
}
