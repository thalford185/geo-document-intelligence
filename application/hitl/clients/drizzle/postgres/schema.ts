import {
  integer,
  pgTable,
  varchar,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";
export const documents = pgTable(
  "documents",
  {
    pk: integer().primaryKey().generatedAlwaysAsIdentity(),
    id: uuid().unique().notNull(),
    rawDocumentId: uuid().unique().notNull(),
    name: varchar().notNull(),
  },
  (table) => [uniqueIndex("id_idx").on(table.id)],
);
