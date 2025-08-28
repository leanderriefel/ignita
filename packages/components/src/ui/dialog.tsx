"use client"

import { createContext, forwardRef, useContext, useState } from "react"
import { XIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@ignita/lib"

import { Button } from "./button"

interface DialogContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const DialogContext = createContext<DialogContextType | undefined>(undefined)

const useDialogContext = () => {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error("Dialog components must be used within a Dialog")
  }
  return context
}

const Dialog = ({
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) => {
  const [internalOpen, setInternalOpen] = useState(false)

  const open = controlledOpen ?? internalOpen
  const onOpenChange = controlledOnOpenChange ?? setInternalOpen

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange} {...props}>
      <DialogContext.Provider
        value={{
          open,
          setOpen: onOpenChange,
        }}
      >
        {children}
      </DialogContext.Provider>
    </DialogPrimitive.Root>
  )
}

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
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    close?: {
      disabled?: boolean
      className?: string
    }
  }
>(({ className, children, close, ...props }, ref) => {
  const { open } = useDialogContext()

  return (
    <AnimatePresence>
      {open && (
        <DialogPortal forceMount container={document.getElementById("app")}>
          <DialogOverlay key="dialog-overlay" />
          <DialogPrimitive.Content key="dialog-content" asChild {...props}>
            <motion.div
              ref={ref}
              key="dialog-content-motion"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%]",
                "grid w-full max-w-lg gap-4 overflow-hidden rounded-xl border bg-card p-8 text-card-foreground shadow-lg",
                "before:absolute before:inset-0 before:-z-1 before:rounded-lg before:bg-gradient-to-b before:from-transparent before:to-primary/10 dark:before:to-primary/3",
                className,
              )}
            >
              {children}
              {!close?.disabled && (
                <DialogPrimitive.Close asChild>
                  <Button
                    size="square"
                    variant="ghost"
                    className={cn(
                      "absolute top-4 right-4 disabled:pointer-events-none",
                      close?.className,
                    )}
                  >
                    <XIcon className="size-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </DialogPrimitive.Close>
              )}
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPortal>
      )}
    </AnimatePresence>
  )
})
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
    className={cn("text-sm text-muted-foreground", className)}
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
