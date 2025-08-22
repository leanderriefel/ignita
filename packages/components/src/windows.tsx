"use client"

import { Chat } from "./ai/chat"
import { ChatProvider, ChatSidebar } from "./ai/chat-sidebar"
import { EditorProvider } from "./note-views/text/editor-context"
import { NotesTree } from "./notes-tree/notes-tree"
import { Sidebar, SidebarProvider } from "./ui/sidebar"
import { WorkspaceDropdown } from "./workspace-dropdown"

export const WithWindows = ({ children }: { children: React.ReactNode }) => {
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
          <div className="flex size-full overflow-hidden bg-muted before:absolute before:inset-0 before:-z-1 before:rounded-lg before:bg-gradient-to-b before:from-transparent before:to-primary/10 before:blur-md dark:before:to-primary/3">
            <Sidebar className="flex flex-col gap-y-2 py-9">
              <div className="text-center">
                <WorkspaceDropdown />
              </div>
              <div className="grow">
                <NotesTree />
              </div>
            </Sidebar>
            <div className="relative m-2 min-w-0 flex-1 overflow-hidden rounded-xl border bg-background text-foreground">
              {children}
            </div>
            <ChatSidebar>
              <Chat />
            </ChatSidebar>
          </div>
        </EditorProvider>
      </ChatProvider>
    </SidebarProvider>
  )
}
