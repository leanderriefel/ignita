export declare const NoteItem: ({
  note,
}: {
  note: {
    id: string
    parentId: string | null
    name: string
    workspaceId: string
  }
}) => import("react").JSX.Element
export declare const NoteList: ({
  notes,
  parentId,
  className,
}: {
  notes: {
    id: string
    parentId: string | null
    name: string
    workspaceId: string
  }[]
  parentId: string | undefined
  className?: string
}) => import("react").JSX.Element
export declare const SidebarNotesSelection: () => import("react").JSX.Element
//# sourceMappingURL=notes-tree.d.ts.map
