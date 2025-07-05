import { forwardRef } from "react"
import { Cross2Icon } from "@radix-ui/react-icons"
import { AnimatePresence, motion } from "motion/react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@ignita/lib"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay asChild {...props}>
    <motion.div
      ref={ref}
      key="dialog-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.8 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("fixed inset-0 z-50 bg-black/80", className)}
    />
  </DialogPrimitive.Overlay>
))
DialogOverlay.displayName = "DialogOverlay"

const DialogContent = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal container={document.getElementById("app")}>
    <AnimatePresence>
      <DialogOverlay key="dialog-overlay" />
      <DialogPrimitive.Content key="dialog-content" asChild {...props}>
        <motion.div
          ref={ref}
          key="dialog-content-motion"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "bg-card text-card-foreground fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 overflow-hidden border p-8 shadow-lg sm:rounded-lg",
            "before:to-primary/10 before:absolute before:inset-0 before:-z-1 before:rounded-lg before:bg-gradient-to-b before:from-transparent before:blur-md",
            className,
          )}
        >
          {children}
          <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:bg-secondary/100 absolute top-4 right-4 cursor-pointer rounded-md p-2 opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
            <Cross2Icon className="size-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </motion.div>
      </DialogPrimitive.Content>
    </AnimatePresence>
  </DialogPortal>
))
DialogContent.displayName = "DialogContent"

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className,
    )}
    {...props}
  />
)

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className,
    )}
    {...props}
  />
)

const DialogTitle = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg leading-none font-semibold tracking-tight",
      className,
    )}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
))
DialogDescription.displayName = "DialogDescription"

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
