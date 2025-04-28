import {
  Boundary,
  PartialBoundary,
  DocumentRegion,
} from "@/document/core/model";

export default interface DocumentBoundaryUseCase {
  getBoundary(
    documentId: string,
    documentRegion: DocumentRegion,
  ): Promise<Boundary | null>;
  getBoundaryCompletion(
    documentId: string,
    documentRegion: DocumentRegion,
    partialBoundary: PartialBoundary,
  ): Promise<PartialBoundary | null>;
}
