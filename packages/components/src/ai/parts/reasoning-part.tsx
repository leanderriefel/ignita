import { memo, useState } from "react"
import { ChevronDownIcon } from "@radix-ui/react-icons"
import type { ReasoningUIPart } from "ai"
import { AnimatePresence, motion } from "motion/react"

import { Button } from "../../ui/button"

export const ReasoningPart = memo(({ part }: { part: ReasoningUIPart }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="my-1 text-xs text-muted-foreground">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen((v) => !v)}
        className="text-xs"
      >
        <span>Reasoning</span>
        <motion.span
          animate={{ rotate: isOpen ? 0 : -90 }}
          transition={{ type: "spring", stiffness: 350, damping: 26 }}
          className="inline-flex items-center"
        >
          <ChevronDownIcon />
        </motion.span>
      </Button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="reasoning-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mb-2 whitespace-pre-wrap">{part.text}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
