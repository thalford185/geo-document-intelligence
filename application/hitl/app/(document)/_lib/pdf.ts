import { Dimension } from "@/document/core/model";
import { PDFPageProxy } from "pdfjs-dist";

const PDFJS_DEFAULT_DPI = 72;
const MM_PER_INCH = 25.4;

export function getPdfPageDimensionInMm(page: PDFPageProxy): Dimension {
  const { width, height } = page.getViewport({
    scale: 1 / (PDFJS_DEFAULT_DPI / MM_PER_INCH),
  });
  return {
    width,
    height,
  };
}
