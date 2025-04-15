import { Document } from "@/document/core/model";

export default interface DocumentRepository {
  create(document: Document): Promise<void>;
  getById(id: string): Promise<Document | null>;
  findAll(): Promise<Document[]>;
}
