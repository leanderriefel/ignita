/* eslint-disable @typescript-eslint/no-explicit-any */
import { sql } from "drizzle-orm"
import { type PgColumn } from "drizzle-orm/pg-core"

// Type to get nested path types
type PathsToStringProperty<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends string
        ? K
        : T[K] extends object
          ? `${K & string}.${PathsToStringProperty<T[K]>}`
          : never
    }[keyof T & string]
  : never

// Helper type to extract the data type from a PgColumn
type ExtractColumnData<T> =
  T extends PgColumn<infer Config, any, any>
    ? Config extends { data: any }
      ? Config["data"]
      : never
    : never

export function jsonExtract<
  TColumn extends PgColumn<any, any, any>,
  TPath extends PathsToStringProperty<NonNullable<ExtractColumnData<TColumn>>>,
>(column: TColumn, path: TPath) {
  const parts = path.split(".")
  const lastPart = parts.pop()

  if (!lastPart) {
    throw new Error("Invalid path")
  }

  const pathParts = parts.length
    ? parts.map((p) => `'${p}'`).join("->") + `->'${lastPart}'`
    : `'${lastPart}'`
  return sql`${column}->>${sql.raw(pathParts)}`
}
