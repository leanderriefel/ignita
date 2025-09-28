import {
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react"

interface MagnetProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: number
  disabled?: boolean
  magnetStrength?: number
  activeTransition?: string
  inactiveTransition?: string
  wrapperClassName?: string
  innerClassName?: string
  stiffness?: number
  damping?: number
  mass?: number
}

export const Magnet = ({
  children,
  padding = 100,
  disabled = false,
  magnetStrength = 2.5,
  activeTransition = "transform 0.3s ease-out",
  inactiveTransition = "transform 0.5s ease-in-out",
  wrapperClassName = "",
  innerClassName = "",
  stiffness = 300,
  damping = 25,
  mass = 3,
  ...props
}: MagnetProps) => {
  const [isActive, setIsActive] = useState<boolean>(false)
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  })
  const magnetRef = useRef<HTMLDivElement>(null)
  const positionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const targetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const velocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  const startAnimationRef = useRef<() => void>(() => {})

  useEffect(() => {
    if (disabled) {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastTimeRef.current = null
      targetRef.current = { x: 0, y: 0 }
      velocityRef.current = { x: 0, y: 0 }
      positionRef.current = { x: 0, y: 0 }
      setIsActive(false)
      setPosition({ x: 0, y: 0 })
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!magnetRef.current) return

      const { left, top, width, height } =
        magnetRef.current.getBoundingClientRect()
      const centerX = left + width / 2
      const centerY = top + height / 2

      const distX = Math.abs(centerX - e.clientX)
      const distY = Math.abs(centerY - e.clientY)

      if (distX < width / 2 + padding && distY < height / 2 + padding) {
        setIsActive(true)
        const offsetX = (e.clientX - centerX) / magnetStrength
        const offsetY = (e.clientY - centerY) / magnetStrength
        targetRef.current = { x: offsetX, y: offsetY }
        startAnimationRef.current()
      } else {
        setIsActive(false)
        targetRef.current = { x: 0, y: 0 }
        startAnimationRef.current()
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [padding, disabled, magnetStrength])

  useEffect(() => {
    if (disabled) {
      startAnimationRef.current = () => {}
      return
    }

    const step = (timestamp: number) => {
      const last = lastTimeRef.current
      lastTimeRef.current = timestamp
      const dtMs = last ? timestamp - last : 16.67
      const dt = Math.min(dtMs, 50) / 1000

      const k = stiffness
      const c = damping
      const m = mass

      const tx = targetRef.current.x
      const ty = targetRef.current.y

      let vx = velocityRef.current.x
      let vy = velocityRef.current.y

      let x = positionRef.current.x
      let y = positionRef.current.y

      const ax = (-k * (x - tx) - c * vx) / m
      const ay = (-k * (y - ty) - c * vy) / m

      vx += ax * dt
      vy += ay * dt

      x += vx * dt
      y += vy * dt

      const EPS = 0.1
      const atRest =
        Math.abs(vx) < EPS &&
        Math.abs(vy) < EPS &&
        Math.abs(x - tx) < EPS &&
        Math.abs(y - ty) < EPS

      if (atRest) {
        velocityRef.current = { x: 0, y: 0 }
        positionRef.current = { x: tx, y: ty }
        setPosition((prev) =>
          prev.x !== tx || prev.y !== ty ? { x: tx, y: ty } : prev,
        )
        if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
        lastTimeRef.current = null
        return
      }

      velocityRef.current = { x: vx, y: vy }
      positionRef.current = { x, y }
      setPosition((prev) => (prev.x !== x || prev.y !== y ? { x, y } : prev))

      rafRef.current = window.requestAnimationFrame(step)
    }

    startAnimationRef.current = () => {
      if (rafRef.current !== null) return
      lastTimeRef.current = null
      rafRef.current = window.requestAnimationFrame(step)
    }

    return () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastTimeRef.current = null
    }
  }, [disabled, stiffness, damping, mass])

  const transitionStyle = disabled
    ? isActive
      ? activeTransition
      : inactiveTransition
    : "transform 0s"

  return (
    <div
      ref={magnetRef}
      className={wrapperClassName}
      style={{ position: "relative", display: "inline-block" }}
      {...props}
    >
      <div
        className={innerClassName}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          transition: transitionStyle,
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  )
}
