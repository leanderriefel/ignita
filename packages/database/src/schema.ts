import { relations } from "drizzle-orm"
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core"

import type { Note } from "@ignita/lib/notes"

export const users = pgTable("users", {
  id: text().primaryKey(),
  name: text(),
  email: text().unique(),
  emailVerified: boolean().default(false),
  image: text(),
  createdAt: timestamp({ mode: "date" }).defaultNow(),
  updatedAt: timestamp({ mode: "date" }).defaultNow(),
})

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  workspaces: many(workspaces),
}))

export const accounts = pgTable(
  "accounts",
  {
    id: text().primaryKey(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerId: text().notNull(),
    accountId: text().notNull(),
    refreshToken: text(),
    accessToken: text(),
    accessTokenExpiresAt: timestamp({ mode: "date" }),
    refreshTokenExpiresAt: timestamp({ mode: "date" }),
    scope: text(),
    idToken: text(),
    password: text(),
    createdAt: timestamp({ mode: "date" }).defaultNow(),
    updatedAt: timestamp({ mode: "date" }).defaultNow(),
  },
  (account) => [index("idx_accounts_userId").on(account.userId)],
)

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export const sessions = pgTable(
  "sessions",
  {
    id: text().primaryKey(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text().notNull().unique(),
    expiresAt: timestamp({ mode: "date" }).notNull(),
    ipAddress: text(),
    userAgent: text(),
    createdAt: timestamp({ mode: "date" }).defaultNow(),
    updatedAt: timestamp({ mode: "date" }).defaultNow(),
  },
  (table) => [index("idx_sessions_userId").on(table.userId)],
)

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const verifications = pgTable("verifications", {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp({ mode: "date" }).notNull(),
  createdAt: timestamp({ mode: "date" }).defaultNow(),
  updatedAt: timestamp({ mode: "date" }).defaultNow(),
})

export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text().notNull(),
    createdAt: timestamp({ mode: "date" }).defaultNow(),
  },
  (table) => [index("idx_workspace_userId").on(table.userId)],
)

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  user: one(users, { fields: [workspaces.userId], references: [users.id] }),
  notes: many(notes),
}))

export const notes = pgTable(
  "notes",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: uuid()
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    parentId: uuid().references((): AnyPgColumn => notes.id, {
      onDelete: "cascade",
    }),
    name: text().notNull(),
    createdAt: timestamp({ mode: "date" }).defaultNow(),
    updatedAt: timestamp({ mode: "date" }).defaultNow(),
    note: jsonb().$type<Note>().notNull(),
  },
  (table) => [
    index("idx_notes_workspace").on(table.workspaceId),
    index("idx_notes_parent").on(table.parentId),
  ],
)

export const notesRelations = relations(notes, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [notes.workspaceId],
    references: [workspaces.id],
  }),
  parent: one(notes, {
    relationName: "parent",
    fields: [notes.parentId],
    references: [notes.id],
  }),
  children: many(notes, {
    relationName: "parent",
  }),
}))
