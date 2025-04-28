import { getDocument, PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import "pdfjs-dist/webpack";
import { useEffect, useState } from "react";

export function usePdfDocument(
  rawDocumentUrl: string,
): PDFDocumentProxy | undefined {
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy>();

  useEffect(() => {
    let ignore = false;
    getDocument(rawDocumentUrl).promise.then((updatedPdfDocument) => {
      if (ignore) {
        updatedPdfDocument.cleanup();
      } else {
        setPdfDocument(updatedPdfDocument);
      }
    });
    return () => {
      ignore = true;
    };
  }, [rawDocumentUrl]);

  return pdfDocument;
}

export function usePdfDocumentPage(
  pdfDocument: PDFDocumentProxy,
  pageNumber: number,
): PDFPageProxy | undefined {
  const [pdfPage, setPdfPage] = useState<PDFPageProxy>();

  useEffect(() => {
    setPdfPage(undefined);
    let ignore = false;
    pdfDocument.getPage(pageNumber).then((updatedPdfPage) => {
      if (ignore) {
        updatedPdfPage.cleanup();
      } else {
        setPdfPage(updatedPdfPage);
      }
    });
    return () => {
      ignore = true;
    };
  }, [pdfDocument, pageNumber]);

  return pdfPage;
}
