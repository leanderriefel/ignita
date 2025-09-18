import { ReactNode, useEffect, useState } from "react"
import { Keyboard, Platform, View, type ViewProps } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { cn } from "@ignita/lib"

type KeyboardAwareCenterProps = ViewProps & {
  children?: ReactNode
}

const KeyboardAwareCenter = ({
  children,
  className,
  style,
  ...props
}: KeyboardAwareCenterProps) => {
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
    <View
      className={cn("flex-1 items-center justify-center", className)}
      style={[style, { paddingBottom: bottomPadding }]}
      {...props}
    >
      {children}
    </View>
  )
}

export { KeyboardAwareCenter }
