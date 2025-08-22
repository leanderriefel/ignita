"use client"

import type { ComponentProps } from "react"
import { XIcon } from "lucide-react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@ignita/lib"

import { Button } from "./button"

const Drawer = ({
  handleOnly = true,
  ...props
}: ComponentProps<typeof DrawerPrimitive.Root>) => {
  return (
    <DrawerPrimitive.Root
      data-slot="drawer"
      handleOnly={handleOnly}
      {...props}
    />
  )
}

const DrawerTrigger = ({
  ...props
}: ComponentProps<typeof DrawerPrimitive.Trigger>) => {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

const DrawerPortal = ({
  ...props
}: ComponentProps<typeof DrawerPrimitive.Portal>) => {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

const DrawerClose = ({
  ...props
}: ComponentProps<typeof DrawerPrimitive.Close>) => {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

const DrawerOverlay = ({
  className,
  ...props
}: ComponentProps<typeof DrawerPrimitive.Overlay>) => {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className,
      )}
      {...props}
    />
  )
}

const DrawerContent = ({
  className,
  children,
  ...props
}: ComponentProps<typeof DrawerPrimitive.Content>) => {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content fixed z-50 flex h-auto flex-col rounded-3xl bg-background p-8 after:hidden focus:outline-none",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
          "data-[vaul-drawer-direction=right]:inset-y-4 data-[vaul-drawer-direction=right]:right-4 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:overflow-hidden data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-2xl",
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-2xl",
          className,
        )}
        {...props}
      >
        {children}
        <DrawerClose asChild>
          <Button
            variant="ghost"
            size="square"
            className="absolute top-8 right-8 p-1"
          >
            <XIcon className="size-4" />
          </Button>
        </DrawerClose>
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}

const DrawerHeader = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left",
        className,
      )}
      {...props}
    />
  )
}

const DrawerFooter = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

const DrawerTitle = ({
  className,
  ...props
}: ComponentProps<typeof DrawerPrimitive.Title>) => {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("font-semibold text-foreground", className)}
      {...props}
    />
  )
}

const DrawerDescription = ({
  className,
  ...props
}: ComponentProps<typeof DrawerPrimitive.Description>) => {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
