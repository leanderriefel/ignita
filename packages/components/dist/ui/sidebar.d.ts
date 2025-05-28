import { type Dispatch, type SetStateAction } from "react"

export type SidebarProps = {
  children?: React.ReactNode
  className?: string
}
export declare const Sidebar: ({
  children,
  className,
}: SidebarProps) => import("react").JSX.Element
export declare const SidebarToggle: ({
  className,
}: {
  className?: string
}) => import("react").JSX.Element
type SidebarContextType = {
  toggled: boolean
  setToggled: Dispatch<SetStateAction<boolean>>
  minWidth: number
  maxWidth: number
  initialWidth: number
  width: number
  setWidth: Dispatch<SetStateAction<number>>
}
export declare const SidebarContent: import("react").Context<SidebarContextType>
export declare const useSidebar: () => SidebarContextType
export type SidebarProviderProps = {
  minWidth?: number
  maxWidth?: number
  initialWidth?: number
  children: React.ReactNode
  widthCookie?: string
  toggledCookie?: string
  widthCookieName?: string
  toggledCookieName: string
}
export declare const SidebarProvider: ({
  minWidth,
  maxWidth,
  initialWidth,
  children,
  widthCookie,
  toggledCookie,
  widthCookieName,
  toggledCookieName,
}: SidebarProviderProps) => import("react").JSX.Element
export {}
//# sourceMappingURL=sidebar.d.ts.map
