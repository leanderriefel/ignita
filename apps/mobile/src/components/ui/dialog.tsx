import { Fragment, ReactNode, useEffect, useState } from "react"
import * as DialogPrimitive from "@rn-primitives/dialog"
import { X } from "lucide-react-native"
import { Keyboard, Platform, Text, View, type ViewProps } from "react-native"
import { FadeIn, FadeOut } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
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
          "absolute bottom-0 left-0 right-0 top-0 z-50 flex items-center justify-center bg-black/50 p-2",
          Platform.select({
            web: "fixed cursor-default animate-in fade-in-0 [&>*]:cursor-auto",
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
            className="w-full flex-1"
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
  const insets = useSafeAreaInsets()
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => setKeyboardHeight(e.endCoordinates.height ?? 0),
    )
    const hide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0),
    )
    return () => {
      show.remove()
      hide.remove()
    }
  }, [])

  const bottomPadding = Math.max(0, keyboardHeight - insets.bottom)
  return (
    <DialogPortal hostName={portalHost}>
      <DialogOverlay>
        <View
          className="w-full flex-1 items-center justify-center"
          style={{ paddingBottom: bottomPadding }}
        >
          <DialogPrimitive.Content
            className={cn(
              "z-50 mx-auto flex max-h-[80%] w-full max-w-[calc(100%-2rem)] flex-col gap-4 rounded-lg border border-border bg-background p-6 shadow-lg shadow-black/5 sm:max-w-lg",
              Platform.select({
                web: "duration-200 animate-in fade-in-0 zoom-in-95",
              }),
              className,
            )}
            {...props}
          >
            <>{children}</>
            <DialogPrimitive.Close
              className={cn(
                "absolute right-4 top-4 rounded opacity-70 active:opacity-100",
                Platform.select({
                  web: "ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=open]:bg-accent",
                }),
              )}
              hitSlop={12}
            >
              <Icon
                as={X}
                className={cn(
                  "size-4 shrink-0 text-accent-foreground web:pointer-events-none",
                )}
              />
              <Text className="sr-only">Close</Text>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </View>
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

const DialogTitle = ({ className, ...props }: DialogPrimitive.TitleProps) => {
  return (
    <DialogPrimitive.Title
      className={cn(
        "text-lg font-semibold leading-none text-foreground",
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

