import type { UIMessage } from "ai"
import { relations } from "drizzle-orm"
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core"

import type { Note } from "@ignita/lib/notes"

export const users = pgTable(
  "users",
  {
    id: text().primaryKey(),
    name: text(),
    email: text().unique(),
    emailVerified: boolean().default(false),
    image: text(),
    createdAt: timestamp({ mode: "date" }).defaultNow(),
    updatedAt: timestamp({ mode: "date" }).defaultNow(),
  },
  (table) => [index("idx_users_email").on(table.email)],
)

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  workspaces: many(workspaces),
  chats: many(chats),
  providerKeys: many(providerKeys),
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
  (table) => [
    index("idx_sessions_userId").on(table.userId),
    index("idx_sessions_token").on(table.token),
  ],
)

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const verifications = pgTable(
  "verifications",
  {
    id: text().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp({ mode: "date" }).notNull(),
    createdAt: timestamp({ mode: "date" }).defaultNow(),
    updatedAt: timestamp({ mode: "date" }).defaultNow(),
  },
  (table) => [index("idx_verifications_identifier").on(table.identifier)],
)

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
    position: integer().notNull(),
    name: text().notNull(),
    createdAt: timestamp({ mode: "date" }).defaultNow(),
    updatedAt: timestamp({ mode: "date" }).defaultNow(),
    note: jsonb().$type<Note>().notNull(),
    version: integer().notNull().default(1),
  },
  (table) => [
    index("idx_notes_workspace").on(table.workspaceId),
    index("idx_notes_parentId").on(table.parentId),
  ],
)

export const notesRelations = relations(notes, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [notes.workspaceId],
    references: [workspaces.id],
  }),
}))

export const chats = pgTable(
  "chats",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    messages: jsonb().$type<UIMessage[]>().notNull(),
    createdAt: timestamp({ mode: "date" }).defaultNow(),
    updatedAt: timestamp({ mode: "date" }),
  },
  (table) => [index("idx_chats_userId").on(table.userId)],
)

export const chatsRelations = relations(chats, ({ one }) => ({
  user: one(users, { fields: [chats.userId], references: [users.id] }),
}))

export const providerKeys = pgTable(
  "provider_keys",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text({ enum: ["openrouter"] }).notNull(),
    apiKey: text().notNull(),
    createdAt: timestamp({ mode: "date" }).defaultNow(),
    updatedAt: timestamp({ mode: "date" }),
  },
  (table) => [
    uniqueIndex("uniq_provider_keys_user_provider").on(
      table.userId,
      table.provider,
    ),
    index("idx_provider_keys_user").on(table.userId),
    index("idx_provider_keys_provider").on(table.provider),
  ],
)

export const providerKeysRelations = relations(providerKeys, ({ one }) => ({
  user: one(users, { fields: [providerKeys.userId], references: [users.id] }),
}))
