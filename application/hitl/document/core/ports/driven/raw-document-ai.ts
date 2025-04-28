import {
  Boundary,
  DocumentRegion,
  PartialBoundary,
} from "@/document/core/model";

export default interface RawDocumentAi {
  getBoundary(
    rawDocumentId: string,
    documentRegion: DocumentRegion,
  ): Promise<Boundary | null>;
  completeBoundary(
    rawDocumentId: string,
    documentRegion: DocumentRegion,
    partialBoundary: PartialBoundary,
  ): Promise<PartialBoundary | null>;
}
