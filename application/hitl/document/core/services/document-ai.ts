import DocumentRepository from "@/document/core/ports/driven/document-repository";
import {
  Boundary,
  Document,
  DocumentRegion,
  PartialBoundary,
  RawDocument,
} from "@/document/core/model";
import RawDocumentAi from "@/document/core/ports/driven/raw-document-ai";
import RawDocumentStorage from "@/document/core/ports/driven/raw-document-storage";
import DocumentBoundaryUseCase from "../ports/driving/document-boundary-use-case";
import DocumentUseCase from "../ports/driving/document-use-case";

export default class DocumentAiService
  implements DocumentUseCase, DocumentBoundaryUseCase
{
  constructor(
    private documentRepository: DocumentRepository,
    private rawDocumentAi: RawDocumentAi,
    private rawDocumentStorage: RawDocumentStorage,
  ) {}
  async get(id: string): Promise<Document | null> {
    const document = await this.documentRepository.getById(id);
    return document;
  }
  async getAll(): Promise<Document[]> {
    const documents = await this.documentRepository.findAll();
    return documents;
  }
  async getRawDocument(id: string): Promise<RawDocument | null> {
    const document = await this.documentRepository.getById(id);
    if (document === null) {
      return null;
    }
    const url = await this.rawDocumentStorage.createUrl(document.rawDocumentId);
    if (url == null) {
      return null;
    }
    return {
      id,
      url,
    };
  }
  async getBoundary(
    documentId: string,
    documentRegion: DocumentRegion,
  ): Promise<Boundary | null> {
    const document = await this.documentRepository.getById(documentId);
    if (document === null) {
      return null;
    }
    const boundary = await this.rawDocumentAi.getBoundary(
      document.rawDocumentId,
      documentRegion,
    );
    return boundary;
  }
  async getBoundaryCompletion(
    documentId: string,
    documentRegion: DocumentRegion,
    partialBoundary: PartialBoundary,
  ): Promise<PartialBoundary | null> {
    const document = await this.documentRepository.getById(documentId);
    if (document === null) {
      return null;
    }
    const boundaryCompletion = await this.rawDocumentAi.completeBoundary(
      document.rawDocumentId,
      documentRegion,
      partialBoundary,
    );
    return boundaryCompletion;
  }
}
