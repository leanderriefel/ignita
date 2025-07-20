"use client"

import { cn } from "@ignita/lib"

export const Loading = ({ className }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-16 fill-foreground", className)}
    >
      <style>{`
        .spinner_b2T7 {
          animation: spinner_xe7Q .8s linear infinite
        }
          
        .spinner_YRVV {
          animation-delay:-.65s
        }
        
        .spinner_c9oY {
          animation-delay:-.5s
        }
        
        @keyframes spinner_xe7Q {
          93.75%,100% {
            r:3px
          }
          
          46.875% {
            r:1.5px
          }
        }
      `}</style>
      <circle className="spinner_b2T7" cx="4" cy="12" r="3" />
      <circle className="spinner_b2T7 spinner_YRVV" cx="12" cy="12" r="3" />
      <circle className="spinner_b2T7 spinner_c9oY" cx="20" cy="12" r="3" />
    </svg>
  )
}
