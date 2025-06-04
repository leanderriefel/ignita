"use client"

import { useCallback, useRef, useState } from "react"

export interface UseDebouncedOptions<TResult> {
  onSuccess?: (result: TResult) => void
  onError?: (error: unknown) => void
  onPending?: () => void
}

export const useDebounced = <TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult> | TResult,
  delay: number,
  options?: UseDebouncedOptions<TResult>,
) => {
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const callback = useCallback(
    (...args: TArgs) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      setIsPending(true)
      setIsSuccess(false)
      options?.onPending?.()
      timerRef.current = setTimeout(() => {
        void (async () => {
          try {
            const result = await fn(...args)
            setIsPending(false)
            setIsSuccess(true)
            options?.onSuccess?.(result)
          } catch (error) {
            setIsPending(false)
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
    setIsPending(false)
  }, [])

  return { callback, isPending, isSuccess, cancel }
}
