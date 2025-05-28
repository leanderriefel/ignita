import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"

declare const DropdownMenu: import("react").FC<DropdownMenuPrimitive.DropdownMenuProps>
declare const DropdownMenuTrigger: import("react").ForwardRefExoticComponent<
  DropdownMenuPrimitive.DropdownMenuTriggerProps &
    import("react").RefAttributes<HTMLButtonElement>
>
declare const DropdownMenuGroup: import("react").ForwardRefExoticComponent<
  DropdownMenuPrimitive.DropdownMenuGroupProps &
    import("react").RefAttributes<HTMLDivElement>
>
declare const DropdownMenuPortal: import("react").FC<DropdownMenuPrimitive.DropdownMenuPortalProps>
declare const DropdownMenuSub: import("react").FC<DropdownMenuPrimitive.DropdownMenuSubProps>
declare const DropdownMenuRadioGroup: import("react").ForwardRefExoticComponent<
  DropdownMenuPrimitive.DropdownMenuRadioGroupProps &
    import("react").RefAttributes<HTMLDivElement>
>
declare const DropdownMenuSubTrigger: import("react").ForwardRefExoticComponent<
  Omit<
    DropdownMenuPrimitive.DropdownMenuSubTriggerProps &
      import("react").RefAttributes<HTMLDivElement>,
    "ref"
  > & {
    inset?: boolean
  } & import("react").RefAttributes<HTMLDivElement>
>
declare const DropdownMenuSubContent: import("react").ForwardRefExoticComponent<
  Omit<
    DropdownMenuPrimitive.DropdownMenuSubContentProps &
      import("react").RefAttributes<HTMLDivElement>,
    "ref"
  > &
    import("react").RefAttributes<HTMLDivElement>
>
declare const DropdownMenuContent: import("react").ForwardRefExoticComponent<
  Omit<
    DropdownMenuPrimitive.DropdownMenuContentProps &
      import("react").RefAttributes<HTMLDivElement>,
    "ref"
  > &
    import("react").RefAttributes<HTMLDivElement>
>
declare const DropdownMenuItem: import("react").ForwardRefExoticComponent<
  Omit<
    DropdownMenuPrimitive.DropdownMenuItemProps &
      import("react").RefAttributes<HTMLDivElement>,
    "ref"
  > & {
    inset?: boolean
  } & import("react").RefAttributes<HTMLDivElement>
>
declare const DropdownMenuCheckboxItem: import("react").ForwardRefExoticComponent<
  Omit<
    DropdownMenuPrimitive.DropdownMenuCheckboxItemProps &
      import("react").RefAttributes<HTMLDivElement>,
    "ref"
  > &
    import("react").RefAttributes<HTMLDivElement>
>
declare const DropdownMenuRadioItem: import("react").ForwardRefExoticComponent<
  Omit<
    DropdownMenuPrimitive.DropdownMenuRadioItemProps &
      import("react").RefAttributes<HTMLDivElement>,
    "ref"
  > &
    import("react").RefAttributes<HTMLDivElement>
>
declare const DropdownMenuLabel: import("react").ForwardRefExoticComponent<
  Omit<
    DropdownMenuPrimitive.DropdownMenuLabelProps &
      import("react").RefAttributes<HTMLDivElement>,
    "ref"
  > & {
    inset?: boolean
  } & import("react").RefAttributes<HTMLDivElement>
>
declare const DropdownMenuSeparator: import("react").ForwardRefExoticComponent<
  Omit<
    DropdownMenuPrimitive.DropdownMenuSeparatorProps &
      import("react").RefAttributes<HTMLDivElement>,
    "ref"
  > &
    import("react").RefAttributes<HTMLDivElement>
>
declare const DropdownMenuShortcut: ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => import("react").JSX.Element
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
//# sourceMappingURL=dropdown-menu.d.ts.map
