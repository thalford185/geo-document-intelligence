import { Document } from "@/document/core/model";

export default interface DocumentRepository {
  getById(id: string): Promise<Document | null>;
  findAll(): Promise<Document[]>;
}
