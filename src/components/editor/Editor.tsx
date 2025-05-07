"use client"

import { Tiptap } from "@/components/editor/Tiptap"
import { Loading } from "@/components/ui/Loading"
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
        <p className="text-destructive">Error loading note</p>
      </div>
    )
  }

  if (data) {
    return <Tiptap note={data} />
  }

  return null
}
