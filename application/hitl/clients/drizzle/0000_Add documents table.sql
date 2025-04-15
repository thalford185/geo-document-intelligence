CREATE TABLE "documents" (
	"pk" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "documents_pk_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"id" uuid NOT NULL,
	"rawDocumentId" uuid NOT NULL,
	"name" varchar NOT NULL,
	CONSTRAINT "documents_id_unique" UNIQUE("id"),
	CONSTRAINT "documents_rawDocumentId_unique" UNIQUE("rawDocumentId")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "id_idx" ON "documents" USING btree ("id");