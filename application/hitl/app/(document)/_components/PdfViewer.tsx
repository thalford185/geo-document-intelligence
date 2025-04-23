import DocumentSkeleton from "@/app/(document)/_components/DocumentSkeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/app/(document)/_components/ui/pagination";
import { getPdfPageDimensionInMm } from "@/app/(document)/_lib/pdf";
import { cn } from "@/app/(document)/_lib/utils";
import { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { useCallback } from "react";

const PDFJS_RENDERING_CANCELLED_EXCEPTION_ERROR_NAME =
  "RenderingCancelledException";

interface PdfPageProps {
  pdfPage: PDFPageProxy;
}
function PdfPage(props: PdfPageProps) {
  const { pdfPage } = props;

  const canvasRef = useCallback(
    (node: HTMLCanvasElement) => {
      if (node === null) {
        return;
      }
      const canvasContext = node.getContext("2d");
      if (!canvasContext) {
        return;
      }
      const renderTask = pdfPage.render({
        canvasContext: canvasContext,
        viewport: pdfPage.getViewport({ scale: 1 }),
      });
      renderTask.promise.catch((error) => {
        if (error.name === PDFJS_RENDERING_CANCELLED_EXCEPTION_ERROR_NAME) {
          return;
        }
        throw error;
      });
      return () => {
        renderTask.cancel();
      };
    },
    [pdfPage]
  );

  const pageDimensionInMm = getPdfPageDimensionInMm(pdfPage);
  const aspectClassName = `aspect-[${Math.round(pageDimensionInMm.width)}/${Math.round(pageDimensionInMm.height)}]`;
  const unscaledViewport = pdfPage.getViewport({ scale: 1 });

  return (
    <canvas
      className={`max-w-full max-h-full ${aspectClassName}`}
      width={unscaledViewport.width}
      height={unscaledViewport.height}
      ref={canvasRef}
      role="img"
      aria-label="pdfViewerPage"
    />
  );
}

interface PdfViewerProps {
  pdfDocument: PDFDocumentProxy;
  paginationIsEnabled?: boolean;
  pdfPage?: PDFPageProxy;
  onUpdatePageNumber?: (updatedPageNumber: number) => void;
  className?: string;
  renderOverlay: (pdfPage: PDFPageProxy) => React.ReactNode;
}
export default function PdfViewer(props: PdfViewerProps) {
  const {
    pdfDocument,
    paginationIsEnabled,
    pdfPage,
    onUpdatePageNumber,
    className,
    renderOverlay,
  } = props;
  const paginationIsEnabledOrDefault = paginationIsEnabled ?? true;
  return (
    <div className={`bg-white ${className}`} aria-label="pdfViewer">
      <div role="presentation" className="p-4 h-9/10">
        <div
          role="presentation"
          className="relative mx-auto h-full max-w-fit shadow-md"
        >
          {pdfPage ? (
            <>
              <PdfPage pdfPage={pdfPage} />
              <div role="presentation" className="absolute top-0 w-full h-full">
                {renderOverlay(pdfPage)}
              </div>
            </>
          ) : (
            <DocumentSkeleton />
          )}
        </div>
      </div>
      <div role="presentation" className="h-1/10">
        <Pagination aria-label="pdfViewerPagination">
          <PaginationContent>
            {[...Array(pdfDocument.numPages).keys()]
              .map((i) => i + 1)
              .map((paginationItemPageNumber) => {
                const itemIsActive =
                  paginationItemPageNumber === pdfPage?.pageNumber;
                const itemIsEnabled =
                  !itemIsActive && paginationIsEnabledOrDefault;
                return (
                  <PaginationItem
                    key={paginationItemPageNumber}
                    onClick={() =>
                      itemIsEnabled &&
                      onUpdatePageNumber !== undefined &&
                      onUpdatePageNumber(paginationItemPageNumber)
                    }
                    role="presentation"
                  >
                    <PaginationLink
                      isActive={itemIsActive}
                      className={cn(
                        itemIsEnabled || "pointer-events-none",
                        paginationIsEnabledOrDefault ||
                          itemIsActive ||
                          "text-gray-300",
                        "select-none"
                      )}
                    >
                      {paginationItemPageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
