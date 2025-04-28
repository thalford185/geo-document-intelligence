"use client";

import BoundingBoxEditor from "@/app/(document)/_components/BoundingBoxEditor";
import PdfViewer from "@/app/(document)/_components/PdfViewer";
import SideBar, {
  SideBarActions,
  SideBarHeader,
} from "@/app/(document)/_components/SideBar";
import SvgBoundingBox from "@/app/(document)/_components/SvgBoundingBox";
import { Button, buttonVariants } from "@/app/(document)/_components/ui/button";
import { usePdfDocumentPage } from "@/app/(document)/_hooks/pdf";
import { normalizeBoundingBox } from "@/app/(document)/_lib/geometry";
import { getPdfPageDimensionInMm } from "@/app/(document)/_lib/pdf";
import { cn } from "@/app/(document)/_lib/utils";
import { BoundingBox, Dimension, DocumentRegion } from "@/document/core/model";
import { SquareMousePointer, Trash } from "lucide-react";
import Link from "next/link";
import { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { useState } from "react";

interface DocumentRegionEditorProps {
  pdfDocument: PDFDocumentProxy;
  doneUrl: (DocumentRegion: DocumentRegion | null) => string;
  backUrl: string;
}

export default function DocumentRegionStep(props: DocumentRegionEditorProps) {
  const { pdfDocument, doneUrl, backUrl } = props;
  const [pageNumber, setPageNumber] = useState(1);
  const pdfPage = usePdfDocumentPage(pdfDocument, pageNumber);
  const [value, setValue] = useState<{
    pageDimension: Dimension;
    pageNumber: number;
    boundingBox: BoundingBox;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  return (
    <div className="flex flex-row h-screen">
      <SideBar>
        <SideBarHeader>
          <h1>Step 1: Select document region</h1>
        </SideBarHeader>
        <p>
          Select the region of the document that contains the geographical
          boundary.
        </p>
        <div className="border-dashed border-2 border-gray-400 rounded-md aspect-square">
          <Button
            variant="ghost"
            className="w-full h-full font-bold"
            size="lg"
            hidden={value !== null}
            disabled={isEditing}
            onClick={() => setIsEditing(true)}
            aria-label="selectDocumentRegion"
          >
            <SquareMousePointer aria-hidden />
            Select document region
          </Button>
          <Button
            variant="ghost"
            className="w-full h-full"
            size="lg"
            hidden={value === null}
            disabled={isEditing}
            onClick={() => setValue(null)}
            aria-label="clearDocumentRegion"
          >
            <Trash aria-hidden />
            Clear document region
          </Button>
        </div>
        <SideBarActions>
          <Link
            href={backUrl}
            className={buttonVariants({ variant: "outline" })}
            aria-label="back"
          >
            Back
          </Link>
          <Link
            className={cn(
              buttonVariants({ variant: "default" }),
              value === null && "pointer-events-none opacity-50",
            )}
            aria-disabled={value === null}
            aria-label="next"
            href={doneUrl(
              value === null
                ? null
                : {
                    pageNumber: value.pageNumber,
                    normalizedBoundingBox: normalizeBoundingBox(
                      value.boundingBox,
                      value.pageDimension,
                    ),
                  },
            )}
          >
            Next
          </Link>
        </SideBarActions>
      </SideBar>
      <PdfViewer
        pdfDocument={pdfDocument}
        pdfPage={pdfPage}
        paginationIsEnabled={value === null}
        className="flex-2/3"
        onUpdatePageNumber={setPageNumber}
        renderOverlay={(pdfPage: PDFPageProxy) => {
          const pdfPageDimension = getPdfPageDimensionInMm(pdfPage);
          if (isEditing) {
            return (
              <BoundingBoxEditor
                dimension={pdfPageDimension}
                onCancel={() => {
                  setIsEditing(false);
                }}
                onDone={(boundingBox: BoundingBox) => {
                  setValue({
                    pageNumber,
                    boundingBox,
                    pageDimension: pdfPageDimension,
                  });
                  setIsEditing(false);
                }}
              />
            );
          }
          if (value?.boundingBox !== undefined) {
            return (
              <svg
                role="img"
                aria-label="boundingBox"
                viewBox={`0 0 ${pdfPageDimension.width} ${pdfPageDimension.height}`}
              >
                <SvgBoundingBox
                  value={value?.boundingBox}
                  dimension={pdfPageDimension}
                />
              </svg>
            );
          }
        }}
      />
    </div>
  );
}
