import { ContextMenu as ContextMenuPrimitive } from "radix-ui"

declare const ContextMenu: import("react").FC<ContextMenuPrimitive.ContextMenuProps>
declare const ContextMenuTrigger: import("react").ForwardRefExoticComponent<
  ContextMenuPrimitive.ContextMenuTriggerProps &
    import("react").RefAttributes<HTMLSpanElement>
>
declare const ContextMenuGroup: import("react").ForwardRefExoticComponent<
  ContextMenuPrimitive.ContextMenuGroupProps &
    import("react").RefAttributes<HTMLDivElement>
>
declare const ContextMenuPortal: import("react").FC<ContextMenuPrimitive.ContextMenuPortalProps>
declare const ContextMenuSub: import("react").FC<ContextMenuPrimitive.ContextMenuSubProps>
declare const ContextMenuRadioGroup: import("react").ForwardRefExoticComponent<
  ContextMenuPrimitive.ContextMenuRadioGroupProps &
    import("react").RefAttributes<HTMLDivElement>
>
declare const ContextMenuSubTrigger: import("react").ForwardRefExoticComponent<
  Omit<
    ContextMenuPrimitive.ContextMenuSubTriggerProps &
      import("react").RefAttributes<HTMLDivElement>,
    "ref"
  > & {
    inset?: boolean
  } & import("react").RefAttributes<HTMLDivElement>
>
declare const ContextMenuSubContent: import("react").ForwardRefExoticComponent<
  Omit<
    ContextMenuPrimitive.ContextMenuSubContentProps &
      import("react").RefAttributes<HTMLDivElement>,
    "ref"
  > &
    import("react").RefAttributes<HTMLDivElement>
>
declare const ContextMenuContent: import("react").ForwardRefExoticComponent<
  Omit<
    ContextMenuPrimitive.ContextMenuContentProps &
      import("react").RefAttributes<HTMLDivElement>,
    "ref"
  > &
    import("react").RefAttributes<HTMLDivElement>
>
declare const ContextMenuItem: import("react").ForwardRefExoticComponent<
  Omit<
    ContextMenuPrimitive.ContextMenuItemProps &
      import("react").RefAttributes<HTMLDivElement>,
    "ref"
  > & {
    inset?: boolean
  } & import("react").RefAttributes<HTMLDivElement>
>
declare const ContextMenuCheckboxItem: import("react").ForwardRefExoticComponent<
  Omit<
    ContextMenuPrimitive.ContextMenuCheckboxItemProps &
      import("react").RefAttributes<HTMLDivElement>,
    "ref"
  > &
    import("react").RefAttributes<HTMLDivElement>
>
declare const ContextMenuRadioItem: import("react").ForwardRefExoticComponent<
  Omit<
    ContextMenuPrimitive.ContextMenuRadioItemProps &
      import("react").RefAttributes<HTMLDivElement>,
    "ref"
  > &
    import("react").RefAttributes<HTMLDivElement>
>
declare const ContextMenuLabel: import("react").ForwardRefExoticComponent<
  Omit<
    ContextMenuPrimitive.ContextMenuLabelProps &
      import("react").RefAttributes<HTMLDivElement>,
    "ref"
  > & {
    inset?: boolean
  } & import("react").RefAttributes<HTMLDivElement>
>
declare const ContextMenuSeparator: import("react").ForwardRefExoticComponent<
  Omit<
    ContextMenuPrimitive.ContextMenuSeparatorProps &
      import("react").RefAttributes<HTMLDivElement>,
    "ref"
  > &
    import("react").RefAttributes<HTMLDivElement>
>
declare const ContextMenuShortcut: {
  ({
    className,
    ...props
  }: React.HTMLAttributes<HTMLSpanElement>): import("react").JSX.Element
  displayName: string
}
export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}
//# sourceMappingURL=context-menu.d.ts.map
