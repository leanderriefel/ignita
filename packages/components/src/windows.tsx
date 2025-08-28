"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { VisuallyHidden } from "radix-ui"

import { Chat } from "./ai/chat"
import { ChatProvider, ChatSidebar } from "./ai/chat-sidebar"
import { EditorProvider } from "./note-views/text/editor-context"
import { NotesTree } from "./notes-tree/notes-tree"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet"
import { Sidebar, SidebarProvider } from "./ui/sidebar"
import { WorkspaceDropdown } from "./workspace-dropdown"

type MobilePanelsContextType = {
  openNotes: () => void
  closeNotes: () => void
  openChat: () => void
  closeChat: () => void
}

const MobilePanelsContext = createContext<MobilePanelsContextType | null>(null)

export const useMobilePanels = () => {
  const ctx = useContext(MobilePanelsContext)
  if (!ctx) throw new Error("useMobilePanels must be used within WithWindows")
  return ctx
}

export const WithWindows = ({ children }: { children: React.ReactNode }) => {
  const [mobileNotesOpen, setMobileNotesOpen] = useState(false)
  const [mobileChatOpen, setMobileChatOpen] = useState(false)

  // Close mobile sheets when switching to desktop
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1280px)") // xl breakpoint
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setMobileNotesOpen(false)
        setMobileChatOpen(false)
      }
    }
    mql.addEventListener("change", handleChange)
    return () => mql.removeEventListener("change", handleChange)
  }, [])

  return (
    <SidebarProvider
      initialWidth={250}
      minWidth={150}
      maxWidth={750}
      widthStorageKey="sidebar-width"
      toggledStorageKey="sidebar-toggled"
    >
      <ChatProvider toggledStorageKey="chat-toggled">
        <EditorProvider>
          <MobilePanelsContext.Provider
            value={{
              openNotes: () => setMobileNotesOpen(true),
              closeNotes: () => setMobileNotesOpen(false),
              openChat: () => setMobileChatOpen(true),
              closeChat: () => setMobileChatOpen(false),
            }}
          >
            <div className="flex size-full overflow-hidden bg-muted before:absolute before:inset-0 before:-z-1 before:rounded-lg before:bg-gradient-to-b before:from-transparent before:to-primary/10 dark:before:to-primary/3">
              {/* Desktop: Notes sidebar */}
              <div className="hidden xl:block">
                <Sidebar className="flex flex-col gap-y-2 py-9">
                  <div className="text-center">
                    <WorkspaceDropdown />
                  </div>
                  <div className="grow">
                    <NotesTree />
                  </div>
                </Sidebar>
              </div>
              {/* Center content */}
              <div className="relative m-2 min-w-0 flex-1 overflow-hidden rounded-xl border bg-background text-foreground">
                {children}
              </div>
              {/* Desktop: Chat sidebar */}
              <ChatSidebar className="hidden xl:flex">
                <Chat />
              </ChatSidebar>
            </div>

            {/* Mobile: Notes (left) sheet */}
            <Sheet open={mobileNotesOpen} onOpenChange={setMobileNotesOpen}>
              <SheetContent side="left" className="p-0">
                <SheetHeader className="p-4">
                  <VisuallyHidden.VisuallyHidden>
                    <SheetTitle>Notes</SheetTitle>
                  </VisuallyHidden.VisuallyHidden>
                </SheetHeader>
                <div className="flex flex-col gap-y-2 pb-4">
                  <div className="mx-auto px-4">
                    <WorkspaceDropdown />
                  </div>
                  <div className="mx-2 grow">
                    <NotesTree />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Mobile: Chat (right) sheet */}
            <Sheet open={mobileChatOpen} onOpenChange={setMobileChatOpen}>
              <SheetContent side="right" className="p-0">
                <SheetHeader className="p-4">
                  <VisuallyHidden.VisuallyHidden>
                    <SheetTitle>Ignita AI</SheetTitle>
                  </VisuallyHidden.VisuallyHidden>
                </SheetHeader>
                <div className="mx-2 mb-2 h-full">
                  <Chat />
                </div>
              </SheetContent>
            </Sheet>
          </MobilePanelsContext.Provider>
        </EditorProvider>
      </ChatProvider>
    </SidebarProvider>
  )
}
