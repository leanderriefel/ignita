import {
  useNavigate,
  type NavigateFunction,
  type NavigateOptions,
} from "react-router"

let navigateFn: NavigateFunction | null = null

export const NavigationProvider = () => {
  navigateFn = useNavigate()
  return null
}

export const navigate = (
  to: string,
  options?: NavigateOptions,
): ReturnType<NavigateFunction> | void => {
  if (!navigateFn) return
  return navigateFn(to, options)
}
