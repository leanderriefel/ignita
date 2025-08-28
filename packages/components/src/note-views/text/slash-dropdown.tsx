"use client"

import { useEffect, useRef, useState } from "react"
import type { Editor } from "@tiptap/react"
import { AnimatePresence, motion } from "motion/react"

import { useSlashCommands } from "./use-slash-commands"

interface SlashDropdownProps {
  editor: Editor
  isOpen: boolean
  query: string
  position: { x: number; y: number }
  onClose: () => void
  onSelect: (item: { command: (editor: Editor) => void }) => void
}

export const SlashDropdown = ({
  editor,
  isOpen,
  query,
  position,
  onClose,
  onSelect,
}: SlashDropdownProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { getSlashCommandItems } = useSlashCommands()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const items = getSlashCommandItems(editor).filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()),
  )

  // Reset selected index when items change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query, items.length])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % items.length)
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + items.length) % items.length)
          break
        case "Enter":
          e.preventDefault()
          if (items[selectedIndex]) {
            onSelect(items[selectedIndex])
          }
          break
        case "Escape":
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, selectedIndex, items, onSelect, onClose])

  // Group items by category
  const groupedItems = items.reduce(
    (acc, item) => {
      const group = item.group
      acc[group] ??= []
      acc[group].push(item)
      return acc
    },
    {} as Record<string, typeof items>,
  )

  if (!isOpen || items.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="fixed z-1000 max-h-80 max-w-80 min-w-60 overflow-y-auto rounded-md border border-border bg-background shadow-lg backdrop-blur-[10px] max-sm:max-h-[200px] max-sm:max-w-[calc(100vw-2rem)] max-sm:min-w-[200px]"
        style={{
          top: `${position.y + 8}px`,
          left: `${position.x}px`,
        }}
      >
        {Object.entries(groupedItems).map(([group, groupItems]) => (
          <div key={group}>
            <div className="border-b border-border bg-muted px-4 py-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              {group}
            </div>
            {groupItems.map((item) => {
              const globalIndex = items.indexOf(item)
              const Icon = item.icon

              return (
                <button
                  key={item.title}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors duration-150 ease-in-out hover:bg-accent data-[selected=true]:bg-accent"
                  data-selected={globalIndex === selectedIndex}
                  onClick={() => onSelect(item)}
                >
                  <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 text-sm font-medium text-foreground">
                      {item.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}
