import { Document, RawDocument } from "@/document/core/model";

export default interface DocumentUseCase {
  get(id: string): Promise<Document | null>;
  getRawDocument(id: string): Promise<RawDocument | null>;
  getAll(): Promise<Document[]>;
}
