import type { BoardNote } from "@ignita/lib/notes"

export type Column = BoardNote["content"]["columns"][number]

export type Card = Column["cards"][number]

export type ColumnRef = {
  column: Column
  element: HTMLDivElement
}

export type CardRef = {
  card: Card
  element: HTMLDivElement
}

export type Dragged = ColumnRef | CardRef | null
