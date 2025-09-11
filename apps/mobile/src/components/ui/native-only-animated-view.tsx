import { ComponentProps, ReactNode, RefAttributes } from "react"
import { Platform } from "react-native"
import Animated from "react-native-reanimated"

/**
 * This component is used to wrap animated views that should only be animated on native.
 * @param props - The props for the animated view.
 * @returns The animated view if the platform is native, otherwise the children.
 * @example
 * <NativeOnlyAnimatedView entering={FadeIn} exiting={FadeOut}>
 *   <Text>I am only animated on native</Text>
 * </NativeOnlyAnimatedView>
 */
const NativeOnlyAnimatedView = (
  props: ComponentProps<typeof Animated.View> & RefAttributes<Animated.View>,
) => {
  if (Platform.OS === "web") {
    return <>{props.children as ReactNode}</>
  } else {
    return <Animated.View {...props} />
  }
}

export { NativeOnlyAnimatedView }
