"use client";

import PdfViewer from "@/app/(document)/_components/PdfViewer";
import PolygonEditor from "@/app/(document)/_components/PolygonEditor";
import SideBar, {
  SideBarActions,
  SideBarHeader,
} from "@/app/(document)/_components/SideBar";
import SvgBoundingBox from "@/app/(document)/_components/SvgBoundingBox";
import SvgPolygon from "@/app/(document)/_components/SvgPolygon";
import { Button, buttonVariants } from "@/app/(document)/_components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/(document)/_components/ui/dialog";
import { usePdfDocumentPage } from "@/app/(document)/_hooks/pdf";
import {
  deNormalizeBoundingBox,
  deNormalizePolygon,
  normalizePolygon,
} from "@/app/(document)/_lib/geometry";
import { getPdfPageDimensionInMm } from "@/app/(document)/_lib/pdf";
import { DocumentRegion, PartialBoundary, Point } from "@/document/core/model";
import axios from "axios";
import { SquareMousePointer, Trash } from "lucide-react";
import Link from "next/link";
import { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { useEffect, useState } from "react";
import { z } from "zod";

const partialBoundaryDto = z.object({
  normalizedVertices: z.array(z.tuple([z.number(), z.number()])),
});

const milliPrecisionJsonReplacer = (key: string, val: unknown) =>
  typeof val === "number" ? Number(val.toFixed(3)) : val;

async function getBoundaryCompletion(
  documentId: string,
  documentRegion: DocumentRegion,
  partialBoundary: PartialBoundary,
): Promise<PartialBoundary> {
  const response = await axios.get(`/api/documents/${documentId}/boundaries`, {
    params: {
      pageNumber: documentRegion.pageNumber,
      boundingBox: JSON.stringify(
        documentRegion.normalizedBoundingBox,
        milliPrecisionJsonReplacer,
      ),
      partialBoundary: JSON.stringify(
        partialBoundary.normalizedVertices,
        milliPrecisionJsonReplacer,
      ),
    },
  });
  const boundaryCompletion = partialBoundaryDto.parse(response.data);
  return boundaryCompletion;
}

interface NotImplementedConfirmDialogProps {
  children: React.ReactNode;
}
function NotImplementedConfirmDialog(props: NotImplementedConfirmDialogProps) {
  const { children } = props;
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Not implemented</DialogTitle>
          <DialogDescription>
            This is a read only demo and saving of document labels has not been
            implemented yet.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Link
            href="/documents"
            className={buttonVariants({ variant: "destructive" })}
          >
            Discard
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DocumentBoundaryEditorProps {
  documentId: string;
  documentRegion: DocumentRegion;
  pdfDocument: PDFDocumentProxy;
  backUrl: string;
}
export default function DocumentBoundaryEditor(
  props: DocumentBoundaryEditorProps,
) {
  const { documentId, pdfDocument, documentRegion, backUrl } = props;
  const pdfPage = usePdfDocumentPage(pdfDocument, documentRegion.pageNumber);
  const [vertices, setVertices] = useState<Point[]>([]);
  const [normalizedInputVertices, setNormalizedInputVertices] = useState<
    Point[]
  >([]);
  const [normalizedSuggestedVertices, setNormalizedSuggestedVertices] =
    useState<Point[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    let ignore = false;
    setNormalizedSuggestedVertices([]);
    getBoundaryCompletion(documentId, documentRegion, {
      normalizedVertices: normalizedInputVertices,
    }).then(({ normalizedVertices }) => {
      if (!ignore) {
        setNormalizedSuggestedVertices(normalizedVertices);
      }
    });
    return () => {
      ignore = true;
    };
  }, [documentId, documentRegion, normalizedInputVertices]);

  return (
    <div className="flex flex-row h-screen">
      <SideBar>
        <SideBarHeader>
          <h1>Step 2: Select boundary</h1>
        </SideBarHeader>
        <p>
          Select the geographical boundary contained within the document region.
        </p>
        <div>
          <div className="border-dashed border-2 border-gray-400 rounded-md aspect-square">
            <Button
              variant="ghost"
              className="w-full h-full font-bold"
              size="lg"
              hidden={vertices.length !== 0}
              disabled={isEditing}
              onClick={() => setIsEditing(true)}
              aria-label="selectBoundary"
            >
              <SquareMousePointer aria-hidden />
              Select boundary
            </Button>
            <Button
              variant="ghost"
              className="w-full h-full font-bold"
              size="lg"
              hidden={vertices.length === 0}
              disabled={isEditing}
              onClick={() => setVertices([])}
              aria-label="clearBoundary"
            >
              <Trash aria-hidden />
              Clear boundary
            </Button>
          </div>
        </div>
        <SideBarActions>
          <Button variant="outline" asChild>
            <Link href={backUrl} aria-label="back">
              Back
            </Link>
          </Button>
          <NotImplementedConfirmDialog>
            <Button aria-label="confirm" disabled={vertices.length === 0}>
              Confirm
            </Button>
          </NotImplementedConfirmDialog>
        </SideBarActions>
      </SideBar>
      <PdfViewer
        pdfDocument={pdfDocument}
        pdfPage={pdfPage}
        paginationIsEnabled={false}
        className="flex-2/3"
        renderOverlay={(pdfPage: PDFPageProxy) => {
          const pdfPageDimension = getPdfPageDimensionInMm(pdfPage);
          if (isEditing) {
            return (
              <>
                <svg
                  className="absolute top-0 z-10"
                  viewBox={`0 0 ${pdfPageDimension.width} ${pdfPageDimension.height}`}
                >
                  <SvgBoundingBox
                    value={deNormalizeBoundingBox(
                      documentRegion.normalizedBoundingBox,
                      pdfPageDimension,
                    )}
                    dimension={pdfPageDimension}
                  />
                </svg>
                <PolygonEditor
                  className="absolute top-0 z-11"
                  dimension={getPdfPageDimensionInMm(pdfPage)}
                  onInput={(workingVerties: Point[]) => {
                    setNormalizedInputVertices(
                      normalizePolygon(workingVerties, pdfPageDimension),
                    );
                  }}
                  onUpdateSuggestedVertices={(suggestedVertices) =>
                    setNormalizedSuggestedVertices(
                      normalizePolygon(suggestedVertices, pdfPageDimension),
                    )
                  }
                  suggestedVertices={deNormalizePolygon(
                    normalizedSuggestedVertices,
                    pdfPageDimension,
                  )}
                  onCancel={() => {
                    if (normalizedInputVertices.length !== 0) {
                      setNormalizedInputVertices([]);
                    }
                    setIsEditing(false);
                  }}
                  onDone={(vertices: Point[]) => {
                    setVertices(vertices);
                    setNormalizedInputVertices([]);
                    setIsEditing(false);
                  }}
                />
              </>
            );
          } else {
            return (
              <>
                <svg
                  className="absolute top-0 z-10"
                  viewBox={`0 0 ${pdfPageDimension.width} ${pdfPageDimension.height}`}
                >
                  <SvgPolygon vertices={vertices} />
                  <SvgBoundingBox
                    value={deNormalizeBoundingBox(
                      documentRegion.normalizedBoundingBox,
                      pdfPageDimension,
                    )}
                    dimension={pdfPageDimension}
                  />
                </svg>
              </>
            );
          }
        }}
      />
    </div>
  );
}
