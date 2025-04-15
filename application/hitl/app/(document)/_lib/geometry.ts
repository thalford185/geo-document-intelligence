import { BoundingBox, Dimension, Point } from "@/document/core/model";

export function normalizePolygon(
  polygon: Point[],
  dimension: Dimension
): Point[] {
  return polygon.map((point) => [
    point[0] / dimension.width,
    point[1] / dimension.height,
  ]);
}

export function deNormalizePolygon(
  polygon: Point[],
  dimension: Dimension
): Point[] {
  return polygon.map((point) => [
    point[0] * dimension.width,
    point[1] * dimension.height,
  ]);
}

export function normalizeBoundingBox(
  boundingBox: BoundingBox,
  dimension: Dimension
): BoundingBox {
  return [
    boundingBox[0] / dimension.width,
    boundingBox[1] / dimension.height,
    boundingBox[2] / dimension.width,
    boundingBox[3] / dimension.height,
  ];
}

export function deNormalizeBoundingBox(
  boundingBox: BoundingBox,
  dimension: Dimension
): BoundingBox {
  return [
    boundingBox[0] * dimension.width,
    boundingBox[1] * dimension.height,
    boundingBox[2] * dimension.width,
    boundingBox[3] * dimension.height,
  ];
}
