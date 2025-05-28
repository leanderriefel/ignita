import { type InferSelectModel } from "drizzle-orm"

import type { workspaces } from "@nuotes/database/schema"

export declare const UpdateWorkspaceDialogTrigger: ({
  children,
  asChild,
  className,
  workspace,
}: {
  children: React.ReactNode
  asChild?: boolean
  className?: string
  workspace: InferSelectModel<typeof workspaces>
}) => import("react").JSX.Element
//# sourceMappingURL=update-workspace-dialog.d.ts.map
