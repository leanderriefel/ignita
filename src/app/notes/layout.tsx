"use client"

import {
  SidebarProvider,
  SidebarToggle,
  useSidebar,
} from "@/components/Sidebar"
import { Sidebar } from "@/components/Sidebar"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

const Inside = ({ children }: { children: React.ReactNode }) => {
  const { toggled, setToggled, width } = useSidebar()

  return (
    <>
      <div className="flex w-dvw h-dvh overflow-hidden">
        <motion.div
          animate={{ width: toggled ? width : 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <Sidebar />
        </motion.div>
        <div className="flex-1 overflow-hidden bg-red-200">{children}</div>
      </div>
      <SidebarToggle
        toggled={toggled}
        setToggled={setToggled}
        className="fixed top-4 left-4 z-10"
      />
    </>
  )
}

const NotesLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <Inside>{children}</Inside>
    </SidebarProvider>
  )
}

export default NotesLayout
