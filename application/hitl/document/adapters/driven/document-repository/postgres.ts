import { eq } from "drizzle-orm";
import { documents as documentsSchema } from "@/clients/drizzle/postgres/schema";
import DocumentRepository from "@/document/core/ports/driven/document-repository";
import { Document } from "@/document/core/model";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

function convertFromDbToModel(
  dbDocument: typeof documentsSchema.$inferSelect
): Document {
  return {
    id: dbDocument.id,
    name: dbDocument.name,
    rawDocumentId: dbDocument.rawDocumentId,
  };
}

function convertToDbModel(
  document: Document
): typeof documentsSchema.$inferInsert {
  return {
    id: document.id,
    name: document.name,
    rawDocumentId: document.rawDocumentId,
  };
}

export default class PostgresDocumentRepository implements DocumentRepository {
  constructor(
    private db: NodePgDatabase<{ documents: typeof documentsSchema }>
  ) {}
  async create(document: Document): Promise<void> {
    const dbDocument = convertToDbModel(document);
    await this.db.insert(documentsSchema).values(dbDocument);
  }
  async getById(documentId: string): Promise<Document | null> {
    const dbDocument = await this.db.query.documents.findFirst({
      where: eq(documentsSchema.id, documentId),
    });
    if (dbDocument === undefined) {
      return null;
    } else {
      return convertFromDbToModel(dbDocument);
    }
  }

  async findAll(): Promise<Document[]> {
    const dbDocuments = await this.db.query.documents.findMany();
    return dbDocuments.map(convertFromDbToModel);
  }
}
