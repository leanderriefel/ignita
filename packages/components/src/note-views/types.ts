import type { RouterOutputs } from "@ignita/trpc"

type NoteType = RouterOutputs["notes"]["getNote"]["note"]["type"]

export type NoteProp<Type extends NoteType = NoteType> = Omit<
  RouterOutputs["notes"]["getNote"],
  "note"
> & {
  note: Extract<RouterOutputs["notes"]["getNote"]["note"], { type: Type }>
}
