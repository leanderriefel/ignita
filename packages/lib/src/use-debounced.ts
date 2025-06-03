"use client"

import { useCallback, useRef, useState } from "react"

export interface UseDebouncedOptions<TResult> {
  onSuccess?: (result: TResult) => void
  onError?: (error: unknown) => void
  onLoading?: () => void
}

export const useDebounced = <TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult> | TResult,
  delay: number,
  options?: UseDebouncedOptions<TResult>,
) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const callback = useCallback(
    (...args: TArgs) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      setIsLoading(true)
      setIsSuccess(false)
      options?.onLoading?.()
      timerRef.current = setTimeout(() => {
        void (async () => {
          try {
            const result = await fn(...args)
            setIsLoading(false)
            setIsSuccess(true)
            options?.onSuccess?.(result)
          } catch (error) {
            setIsLoading(false)
            setIsSuccess(false)
            options?.onError?.(error)
          }
        })()
      }, delay)
    },
    [fn, delay, options],
  )

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsLoading(false)
  }, [])

  return { callback, isLoading, isSuccess, cancel }
}
