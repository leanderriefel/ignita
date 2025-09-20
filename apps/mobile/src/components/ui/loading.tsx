import { View } from "react-native"

import { cn } from "@ignita/lib"

type LoadingProps = {
  className?: string
}

export const Loading = ({ className }: LoadingProps) => {
  return (
    <View
      className={cn(
        "size-4 animate-spin rounded-full border-b-2 border-primary",
        className,
      )}
    />
  )
}
