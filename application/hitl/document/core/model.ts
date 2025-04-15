export type Point = [number, number];
export type BoundingBox = [number, number, number, number];

export interface Dimension {
  width: number;
  height: number;
}

export interface PartialBoundary {
  normalizedVertices: Point[];
}

export interface Boundary {
  normalizedVertices: Point[];
}

export interface DocumentRegion {
  pageNumber: number;
  normalizedBoundingBox: BoundingBox;
}

export interface RawDocument {
  id: string;
  url: string;
}

export interface Document {
  id: string;
  name: string;
  rawDocumentId: string;
}
