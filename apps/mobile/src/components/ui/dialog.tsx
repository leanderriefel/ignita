import { Fragment, ReactNode } from "react"
import * as DialogPrimitive from "@rn-primitives/dialog"
import { X } from "lucide-react-native"
import { Platform, Text, View, type ViewProps } from "react-native"
import { FadeIn, FadeOut } from "react-native-reanimated"
import { FullWindowOverlay as RNFullWindowOverlay } from "react-native-screens"

import { cn } from "@ignita/lib"

import { Icon } from "~/components/ui/icon"
import { NativeOnlyAnimatedView } from "~/components/ui/native-only-animated-view"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const FullWindowOverlay = Platform.OS === "ios" ? RNFullWindowOverlay : Fragment

const DialogOverlay = ({
  className,
  children,
  ...props
}: Omit<DialogPrimitive.OverlayProps, "asChild"> & {
  children?: ReactNode
}) => {
  return (
    <FullWindowOverlay>
      <DialogPrimitive.Overlay
        className={cn(
          "absolute top-0 right-0 bottom-0 left-0 z-50 flex items-center justify-center bg-black/50 p-2",
          Platform.select({
            web: "fixed animate-in cursor-default fade-in-0 [&>*]:cursor-auto",
          }),
          className,
        )}
        {...props}
        asChild={Platform.OS !== "web"}
      >
        <NativeOnlyAnimatedView
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
        >
          <NativeOnlyAnimatedView
            entering={FadeIn.delay(50)}
            exiting={FadeOut.duration(150)}
          >
            <>{children}</>
          </NativeOnlyAnimatedView>
        </NativeOnlyAnimatedView>
      </DialogPrimitive.Overlay>
    </FullWindowOverlay>
  )
}
const DialogContent = ({
  className,
  portalHost,
  children,
  ...props
}: DialogPrimitive.ContentProps & {
  portalHost?: string
}) => {
  return (
    <DialogPortal hostName={portalHost}>
      <DialogOverlay>
        <DialogPrimitive.Content
          className={cn(
            "z-50 mx-auto flex w-full max-w-[calc(100%-2rem)] flex-col gap-4 rounded-lg border border-border bg-background p-6 shadow-lg shadow-black/5 sm:max-w-lg",
            Platform.select({
              web: "animate-in duration-200 fade-in-0 zoom-in-95",
            }),
            className,
          )}
          {...props}
        >
          <>{children}</>
          <DialogPrimitive.Close
            className={cn(
              "absolute top-4 right-4 rounded opacity-70 active:opacity-100",
              Platform.select({
                web: "ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none data-[state=open]:bg-accent",
              }),
            )}
            hitSlop={12}
          >
            <Icon
              as={X}
              className={cn(
                "web:pointer-events-none size-4 shrink-0 text-accent-foreground",
              )}
            />
            <Text className="sr-only">Close</Text>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogOverlay>
    </DialogPortal>
  )
}

const DialogHeader = ({ className, ...props }: ViewProps) => {
  return (
    <View
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

const DialogFooter = ({ className, ...props }: ViewProps) => {
  return (
    <View
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  )
}

const DialogTitle = ({
  className,
  ...props
}: DialogPrimitive.TitleProps) => {
  return (
    <DialogPrimitive.Title
      className={cn(
        "text-lg leading-none font-semibold text-foreground",
        className,
      )}
      {...props}
    />
  )
}

const DialogDescription = ({
  className,
  ...props
}: DialogPrimitive.DescriptionProps) => {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
