import { Dialog as DialogPrimitive } from "radix-ui"

declare const Dialog: import("react").FC<DialogPrimitive.DialogProps>
declare const DialogTrigger: import("react").ForwardRefExoticComponent<
  DialogPrimitive.DialogTriggerProps &
    import("react").RefAttributes<HTMLButtonElement>
>
declare const DialogPortal: import("react").FC<DialogPrimitive.DialogPortalProps>
declare const DialogClose: import("react").ForwardRefExoticComponent<
  DialogPrimitive.DialogCloseProps &
    import("react").RefAttributes<HTMLButtonElement>
>
declare const DialogOverlay: import("react").ForwardRefExoticComponent<
  Omit<
    DialogPrimitive.DialogOverlayProps &
      import("react").RefAttributes<HTMLDivElement>,
    "ref"
  > &
    import("react").RefAttributes<HTMLDivElement>
>
declare const DialogContent: import("react").ForwardRefExoticComponent<
  Omit<
    DialogPrimitive.DialogContentProps &
      import("react").RefAttributes<HTMLDivElement>,
    "ref"
  > &
    import("react").RefAttributes<HTMLDivElement>
>
declare const DialogHeader: ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => import("react").JSX.Element
declare const DialogFooter: ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => import("react").JSX.Element
declare const DialogTitle: import("react").ForwardRefExoticComponent<
  Omit<
    DialogPrimitive.DialogTitleProps &
      import("react").RefAttributes<HTMLHeadingElement>,
    "ref"
  > &
    import("react").RefAttributes<HTMLHeadingElement>
>
declare const DialogDescription: import("react").ForwardRefExoticComponent<
  Omit<
    DialogPrimitive.DialogDescriptionProps &
      import("react").RefAttributes<HTMLParagraphElement>,
    "ref"
  > &
    import("react").RefAttributes<HTMLParagraphElement>
>
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
//# sourceMappingURL=dialog.d.ts.map
