import type { RouterOutputs } from "@ignita/trpc"

type NoteResponse = NonNullable<RouterOutputs["notes"]["getNote"]>
type NoteType = NoteResponse["note"]["type"]

export type NoteProp<Type extends NoteType = NoteType> = Omit<
  NoteResponse,
  "note"
> & {
  note: Extract<NoteResponse["note"], { type: Type }>
}
