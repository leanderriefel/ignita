import { useCallback, useEffect, useRef, useState } from "react"

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      if (item === null) {
        return initialValue
      }

      return JSON.parse(item)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
      }
    },
    [key, storedValue],
  )

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
  }, [key, initialValue])

  const ref = useRef<T>(storedValue)
  ref.current = storedValue

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue)
          if (newValue !== ref.current) {
            setStoredValue(newValue)
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error)
        }
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(initialValue)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [key, initialValue])

  return [storedValue, setValue, removeValue] as const
}
