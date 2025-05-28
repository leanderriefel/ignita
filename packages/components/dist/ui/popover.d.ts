import { Popover as PopoverPrimitive } from "radix-ui"

declare const Popover: import("react").FC<PopoverPrimitive.PopoverProps>
declare const PopoverTrigger: import("react").ForwardRefExoticComponent<
  PopoverPrimitive.PopoverTriggerProps &
    import("react").RefAttributes<HTMLButtonElement>
>
declare const PopoverAnchor: import("react").ForwardRefExoticComponent<
  PopoverPrimitive.PopoverAnchorProps &
    import("react").RefAttributes<HTMLDivElement>
>
declare const PopoverContent: import("react").ForwardRefExoticComponent<
  Omit<
    PopoverPrimitive.PopoverContentProps &
      import("react").RefAttributes<HTMLDivElement>,
    "ref"
  > &
    import("react").RefAttributes<HTMLDivElement>
>
export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
//# sourceMappingURL=popover.d.ts.map
