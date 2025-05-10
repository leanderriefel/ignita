"use client"

import { Tiptap } from "@/components/editor/tiptap"
import { Loading } from "@/components/ui/loading"
import { useTRPC } from "@/lib/trpc"
import { useQuery } from "@tanstack/react-query"

export const Editor = ({ noteId }: { noteId: string }) => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery(
    trpc.notes.getNote.queryOptions({ id: noteId }),
  )

  if (query.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loading className="size-8" />
      </div>
    )
  }

  if (query.isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <em className="text-destructive">
          Error loading note:{" "}
          {query.error.data?.zodError
            ? Object.values(query.error.data.zodError.fieldErrors).join(", ")
            : query.error.message}
        </em>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center">
        <em className="text-muted-foreground">Note not found</em>
      </div>
    )
  }

  return <Tiptap note={data} />
}
