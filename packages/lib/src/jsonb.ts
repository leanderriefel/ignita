/* eslint-disable @typescript-eslint/no-explicit-any */
import { sql } from "drizzle-orm"
import { type PgColumn } from "drizzle-orm/pg-core"

// Advanced type utilities for compile-time type safety

// Get all possible dot-notation paths in an object
type Paths<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${K}` | `${K}.${Paths<T[K]>}`
        : `${K}`
    }[keyof T & string]
  : never

// Get all array paths (paths that point to arrays)
type ArrayPaths<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends any[]
        ? `${K}` | (T[K] extends object ? `${K}.${ArrayPaths<T[K]>}` : never)
        : T[K] extends object
          ? `${K}.${ArrayPaths<T[K]>}`
          : never
    }[keyof T & string]
  : never

// Get the type at a specific path
type PathValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? PathValue<T[K], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never

// Get array item type from array path
type ArrayItemType<T, P extends string> =
  PathValue<T, P> extends any[] ? PathValue<T, P>[number] : never

// Helper type to extract the data type from a PgColumn
type ExtractColumnData<T> =
  T extends PgColumn<infer Config, any, any>
    ? Config extends { data: any }
      ? Config["data"]
      : never
    : never

// Core typesafe JSONB operations

/**
 * Typesafe JSON path extraction
 * Usage: jsonExtract(notes.note, "content.columns")
 */
export const jsonExtract = <
  TColumn extends PgColumn<any, any, any>,
  TPath extends Paths<NonNullable<ExtractColumnData<TColumn>>>,
>(
  column: TColumn,
  path: TPath,
) => {
  const parts = path.split(".")
  const postgresPath = parts.map((p) => `'${p}'`).join(",")
  return sql`${column}#>>'{${sql.raw(postgresPath)}}'`
}

/**
 * Typesafe JSON value update at specific path
 * Usage: jsonSet(notes.note, "content.title", "New Title")
 */
export const jsonSet = <
  TColumn extends PgColumn<any, any, any>,
  TPath extends Paths<NonNullable<ExtractColumnData<TColumn>>>,
  TValue extends PathValue<NonNullable<ExtractColumnData<TColumn>>, TPath>,
>(
  column: TColumn,
  path: TPath,
  value: TValue,
) => {
  const parts = path.split(".")
  const postgresPath = parts.map((p) => `'${p}'`).join(",")

  return sql`
    jsonb_set(
      ${column},
      '{${sql.raw(postgresPath)}}',
      '${sql.raw(JSON.stringify(value))}'::jsonb
    )
  `
}

/**
 * Typesafe array item removal by property match
 * Usage: jsonArrayRemoveBy(notes.note, "content.columns.0.cards", "id", "card-123")
 */
export const jsonArrayRemoveBy = <
  TColumn extends PgColumn<any, any, any>,
  TPath extends ArrayPaths<NonNullable<ExtractColumnData<TColumn>>>,
  TItem extends ArrayItemType<NonNullable<ExtractColumnData<TColumn>>, TPath>,
  TKey extends keyof TItem & string,
>(
  column: TColumn,
  arrayPath: TPath,
  property: TKey,
  value: TItem[TKey],
) => {
  const parts = arrayPath.split(".")
  const postgresPath = parts.map((p) => `'${p}'`).join(",")

  return sql`
    jsonb_set(
      ${column},
      '{${sql.raw(postgresPath)}}',
      (
        SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
        FROM jsonb_array_elements(${column}#>'{${sql.raw(postgresPath)}}') AS elem
        WHERE elem->>'${sql.raw(property)}' != '${sql.raw(String(value))}'
      )
    )
  `
}

/**
 * Typesafe array item addition
 * Usage: jsonArrayAdd(notes.note, "content.columns.0.cards", newCard, 2)
 */
export const jsonArrayAdd = <
  TColumn extends PgColumn<any, any, any>,
  TPath extends ArrayPaths<NonNullable<ExtractColumnData<TColumn>>>,
  TItem extends ArrayItemType<NonNullable<ExtractColumnData<TColumn>>, TPath>,
>(
  column: TColumn,
  arrayPath: TPath,
  item: TItem,
  index?: number,
) => {
  const parts = arrayPath.split(".")
  const postgresPath = parts.map((p) => `'${p}'`).join(",")

  if (index === undefined) {
    // Append to end
    return sql`
      jsonb_set(
        ${column},
        '{${sql.raw(postgresPath)}}',
        COALESCE(${column}#>'{${sql.raw(postgresPath)}}', '[]'::jsonb) || '${sql.raw(JSON.stringify(item))}'::jsonb
      )
    `
  }

  // Insert at specific index
  return sql`
    jsonb_set(
      ${column},
      '{${sql.raw(postgresPath)}}',
      (
        SELECT COALESCE(
          (
            SELECT jsonb_agg(elem)
            FROM (
              SELECT elem, row_number() OVER () - 1 AS idx
              FROM jsonb_array_elements(COALESCE(${column}#>'{${sql.raw(postgresPath)}}', '[]'::jsonb)) AS elem
            ) indexed_items
            WHERE idx < ${index}
          ),
          '[]'::jsonb
        ) ||
        '${sql.raw(JSON.stringify(item))}'::jsonb ||
        COALESCE(
          (
            SELECT jsonb_agg(elem)
            FROM (
              SELECT elem, row_number() OVER () - 1 AS idx
              FROM jsonb_array_elements(COALESCE(${column}#>'{${sql.raw(postgresPath)}}', '[]'::jsonb)) AS elem
            ) indexed_items
            WHERE idx >= ${index}
          ),
          '[]'::jsonb
        )
      )
    )
  `
}

/**
 * Typesafe array reordering
 * Usage: jsonArrayMove(notes.note, "content.columns", 0, 2)
 */
export const jsonArrayMove = <
  TColumn extends PgColumn<any, any, any>,
  TPath extends ArrayPaths<NonNullable<ExtractColumnData<TColumn>>>,
>(
  column: TColumn,
  arrayPath: TPath,
  fromIndex: number,
  toIndex: number,
) => {
  const parts = arrayPath.split(".")
  const postgresPath = parts.map((p) => `'${p}'`).join(",")

  return sql`
    jsonb_set(
      ${column},
      '{${sql.raw(postgresPath)}}',
      (
        SELECT jsonb_agg(
          elem ORDER BY 
            CASE 
              WHEN idx = ${fromIndex} THEN ${toIndex}
              WHEN idx < ${fromIndex} AND idx >= ${toIndex} THEN idx + 1
              WHEN idx > ${fromIndex} AND idx <= ${toIndex} THEN idx - 1
              ELSE idx
            END
        )
        FROM (
          SELECT elem, row_number() OVER () - 1 AS idx
          FROM jsonb_array_elements(${column}#>'{${sql.raw(postgresPath)}}') AS elem
        ) indexed_items
      )
    )
  `
}

/**
 * Typesafe nested array item update
 * Usage: jsonUpdateArrayItem(notes.note, "content.columns", "id", "col-1", "title", "New Title")
 */
export const jsonUpdateArrayItem = <
  TColumn extends PgColumn<any, any, any>,
  TPath extends ArrayPaths<NonNullable<ExtractColumnData<TColumn>>>,
  TItem extends ArrayItemType<NonNullable<ExtractColumnData<TColumn>>, TPath>,
  TMatchKey extends keyof TItem & string,
  TUpdateKey extends keyof TItem & string,
>(
  column: TColumn,
  arrayPath: TPath,
  matchProperty: TMatchKey,
  matchValue: TItem[TMatchKey],
  updateProperty: TUpdateKey,
  newValue: TItem[TUpdateKey],
) => {
  const parts = arrayPath.split(".")
  const postgresPath = parts.map((p) => `'${p}'`).join(",")

  return sql`
    jsonb_set(
      ${column},
      '{${sql.raw(postgresPath)}}',
      (
        SELECT jsonb_agg(
          CASE 
            WHEN elem->>'${sql.raw(matchProperty)}' = '${sql.raw(String(matchValue))}'
            THEN jsonb_set(elem, '{${sql.raw(updateProperty)}}', '${sql.raw(JSON.stringify(newValue))}'::jsonb)
            ELSE elem
          END
        )
        FROM jsonb_array_elements(${column}#>'{${sql.raw(postgresPath)}}') AS elem
      )
    )
  `
}

// Board-specific operations using the utility methods above

/**
 * Remove card from column using the utility methods
 */
export const jsonRemoveCardFromColumn = <
  TColumn extends PgColumn<any, any, any>,
>(
  column: TColumn,
  columnId: string,
  cardId: string,
) => {
  // For board operations we need to find the correct column and remove from its cards array
  // Since we can't use dynamic paths with the utility methods, we use optimized board-specific SQL
  return sql`
    jsonb_set(
      ${column},
      '{content,columns}',
      (
        SELECT jsonb_agg(
          CASE 
            WHEN col->>'id' = '${sql.raw(columnId)}'
            THEN jsonb_set(
              col,
              '{cards}',
              (
                SELECT COALESCE(jsonb_agg(card), '[]'::jsonb)
                FROM jsonb_array_elements(col->'cards') AS card
                WHERE card->>'id' != '${sql.raw(cardId)}'
              )
            )
            ELSE col
          END
        )
        FROM jsonb_array_elements(${column}->'content'->'columns') AS col
      )
    )
  `
}

/**
 * Move card between columns
 */
export const jsonMoveCard = <TColumn extends PgColumn<any, any, any>>(
  column: TColumn,
  sourceColumnId: string,
  targetColumnId: string,
  cardId: string,
  targetIndex: number,
) => {
  return sql`
    jsonb_set(
      ${column},
      '{content,columns}',
      (
        SELECT jsonb_agg(
          CASE 
            WHEN col->>'id' = '${sql.raw(sourceColumnId)}'
            THEN jsonb_set(
              col,
              '{cards}',
              (
                SELECT COALESCE(jsonb_agg(card_elem), '[]'::jsonb)
                FROM jsonb_array_elements(col->'cards') AS card_elem
                WHERE card_elem->>'id' != '${sql.raw(cardId)}'
              )
            )
            WHEN col->>'id' = '${sql.raw(targetColumnId)}'
            THEN jsonb_set(
              col,
              '{cards}',
              (
                SELECT COALESCE(
                  (
                    SELECT jsonb_agg(card_elem)
                    FROM (
                      SELECT card_elem, row_number() OVER () - 1 AS idx
                      FROM jsonb_array_elements(COALESCE(col->'cards', '[]'::jsonb)) AS card_elem
                    ) indexed_cards
                    WHERE idx < ${targetIndex}
                  ),
                  '[]'::jsonb
                ) ||
                (
                  SELECT card_data
                  FROM jsonb_array_elements(${column}->'content'->'columns') AS source_col,
                       jsonb_array_elements(source_col->'cards') AS card_data
                  WHERE source_col->>'id' = '${sql.raw(sourceColumnId)}'
                    AND card_data->>'id' = '${sql.raw(cardId)}'
                  LIMIT 1
                ) ||
                COALESCE(
                  (
                    SELECT jsonb_agg(card_elem)
                    FROM (
                      SELECT card_elem, row_number() OVER () - 1 AS idx
                      FROM jsonb_array_elements(COALESCE(col->'cards', '[]'::jsonb)) AS card_elem
                    ) indexed_cards
                    WHERE idx >= ${targetIndex}
                  ),
                  '[]'::jsonb
                )
              )
            )
            ELSE col
          END
        )
        FROM jsonb_array_elements(${column}->'content'->'columns') AS col
      )
    )
  `
}

/**
 * Reorder columns using the utility method
 */
export const jsonReorderColumns = <TColumn extends PgColumn<any, any, any>>(
  column: TColumn,
  sourceIndex: number,
  targetIndex: number,
) => {
  // Use the utility method since we know the exact path
  return jsonArrayMove(
    column,
    "content.columns" as any,
    sourceIndex,
    targetIndex,
  )
}

/**
 * Update card title
 */
export const jsonUpdateCardTitle = <TColumn extends PgColumn<any, any, any>>(
  column: TColumn,
  cardId: string,
  newTitle: string,
) => {
  return sql`
    jsonb_set(
      ${column},
      '{content,columns}',
      (
        SELECT jsonb_agg(
          jsonb_set(
            col,
            '{cards}',
            (
              SELECT jsonb_agg(
                CASE 
                  WHEN card->>'id' = '${sql.raw(cardId)}'
                  THEN jsonb_set(card, '{title}', '"${sql.raw(newTitle)}"')
                  ELSE card
                END
              )
              FROM jsonb_array_elements(col->'cards') AS card
            )
          )
        )
        FROM jsonb_array_elements(${column}->'content'->'columns') AS col
      )
    )
  `
}

/**
 * Update card content
 */
export const jsonUpdateCardContent = <TColumn extends PgColumn<any, any, any>>(
  column: TColumn,
  cardId: string,
  newContent: string,
) => {
  return sql`
    jsonb_set(
      ${column},
      '{content,columns}',
      (
        SELECT jsonb_agg(
          jsonb_set(
            col,
            '{cards}',
            (
              SELECT jsonb_agg(
                CASE 
                  WHEN card->>'id' = '${sql.raw(cardId)}'
                  THEN jsonb_set(card, '{content}', '${sql.raw(newContent)}')
                  ELSE card
                END
              )
              FROM jsonb_array_elements(col->'cards') AS card
            )
          )
        )
        FROM jsonb_array_elements(${column}->'content'->'columns') AS col
      )
    )
  `
}

/**
 * Add card to column
 */
export const jsonAddCardToColumn = <TColumn extends PgColumn<any, any, any>>(
  column: TColumn,
  columnId: string,
  newCard: string, // JSON string of the card object
) => {
  return sql`
    jsonb_set(
      ${column},
      '{content,columns}',
      (
        SELECT jsonb_agg(
          CASE 
            WHEN col->>'id' = '${sql.raw(columnId)}'
            THEN jsonb_set(
              col,
              '{cards}',
              COALESCE(col->'cards', '[]'::jsonb) || '${sql.raw(newCard)}'::jsonb
            )
            ELSE col
          END
        )
        FROM jsonb_array_elements(${column}->'content'->'columns') AS col
      )
    )
  `
}
