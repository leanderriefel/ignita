"use client"

import { useState, type ComponentPropsWithoutRef } from "react"

import { useDeleteBoardColumn, useUpdateBoardColumn } from "@ignita/hooks"

import { Button } from "../../ui/button"
import { Colorpicker } from "../../ui/colorpicker"
import { Divider } from "../../ui/divider"
import { Input } from "../../ui/input"
import { Loading } from "../../ui/loading"
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"
import type { NoteProp } from "../types"
import type { Column } from "./types"

export const BoardColumnPopoverSettingsTrigger = ({
  column,
  note,
  ...props
}: {
  column: Column
  note: NoteProp<"board">
} & ComponentPropsWithoutRef<typeof PopoverTrigger>) => {
  const deleteBoardColumn = useDeleteBoardColumn({ optimistic: false })
  const updateBoardColumn = useUpdateBoardColumn({ optimistic: true })

  const [editTitle, setEditTitle] = useState(column.title)
  const [currentColor, setCurrentColor] = useState(column.color ?? "#38bdf8")

  return (
    <Popover>
      <PopoverTrigger {...props} />
      <PopoverContent
        className="w-80 p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="space-y-6 p-6">
          <div className="space-y-2">
            <h3 className="text-center text-base font-semibold text-foreground">
              Column Settings
            </h3>
            <p className="text-center text-sm text-muted-foreground">
              Configure your column properties
            </p>
          </div>

          <Divider orientation="horizontal" />

          <div className="space-y-3">
            <label
              htmlFor="column-title"
              className="block text-sm font-medium text-foreground"
            >
              Column Title
            </label>
            <Input
              id="column-title"
              className="w-full"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => {
                updateBoardColumn.mutate({
                  noteId: note.id,
                  columnId: column.id,
                  title: editTitle,
                })
              }}
              placeholder="Enter column title..."
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
              Column Color
            </label>
            <Colorpicker
              className="rounded-md"
              value={currentColor}
              onChange={setCurrentColor}
              onChangeEnd={(color) => {
                updateBoardColumn.mutate({
                  noteId: note.id,
                  columnId: column.id,
                  color,
                })
              }}
            />
          </div>

          <Divider orientation="horizontal" />

          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
              Actions
            </label>
            <Button
              variant="destructive"
              className="w-full justify-center"
              disabled={deleteBoardColumn.isPending}
              onClick={() =>
                deleteBoardColumn.mutate({
                  noteId: note.id,
                  columnId: column.id,
                })
              }
            >
              {deleteBoardColumn.isPending ? (
                <>
                  <Loading className="size-4" />
                  Deleting...
                </>
              ) : (
                "Delete Column"
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
