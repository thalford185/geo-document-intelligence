"use client";

import DocumentSkeleton from "@/app/(document)/_components/DocumentSkeleton";
import SideBar, {
  SideBarActions,
  SideBarHeader,
} from "@/app/(document)/_components/SideBar";
import { Skeleton } from "@/app/(document)/_components/ui/skeleton";
import { usePdfDocument } from "@/app/(document)/_hooks/pdf";
import { parseZodJSONString } from "@/app/(document)/_lib/zod";
import DocumentBoundaryStep from "@/app/(document)/documents/[documentId]/DocumentBoundaryStep";
import DocumentRegionStep from "@/app/(document)/documents/[documentId]/DocumentRegionStep";
import { DocumentRegion } from "@/document/core/model";
import { usePathname, useSearchParams } from "next/navigation";
import { z } from "zod";

interface SideBarSkeletonProps {
  className?: string;
}
function SideBarSkeleton(props: SideBarSkeletonProps) {
  const { className } = props;
  return (
    <SideBar aria-busy className={className}>
      <SideBarHeader>
        <Skeleton className="h-8 rounded-xl"></Skeleton>
      </SideBarHeader>
      <Skeleton className="h-4 rounded-xl"></Skeleton>
      <Skeleton className="h-4 w-[67%] rounded-xl"></Skeleton>
      <Skeleton className="w-full aspect-square rounded-xl"></Skeleton>
      <SideBarActions>
        <Skeleton className="w-32 h-8 rounded-xl"></Skeleton>
        <Skeleton className="w-32 h-8 rounded-xl"></Skeleton>
      </SideBarActions>
    </SideBar>
  );
}

const boundingBoxDtoSchema = z.tuple([
  z.number(),
  z.number(),
  z.number(),
  z.number(),
]);

const documentRegionDtoSchema = z.object({
  pageNumber: z.coerce.number(),
  normalizedBoundingBox: z
    .string()
    .transform(parseZodJSONString)
    .pipe(boundingBoxDtoSchema),
});

interface DocumentLabellerProps {
  documentId: string;
  rawDocumentUrl: string;
}

export default function DocumentLabeller(props: DocumentLabellerProps) {
  const { documentId, rawDocumentUrl } = props;
  const pdfDocument = usePdfDocument(rawDocumentUrl);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const documentRegionParseResult = documentRegionDtoSchema.safeParse({
    pageNumber: searchParams.get("pageNumber"),
    normalizedBoundingBox: searchParams.get("normalizedBoundingBox"),
  });
  const documentRegion = documentRegionParseResult.data || null;
  if (pdfDocument === undefined) {
    return (
      <div className="flex flex-row h-full">
        <SideBarSkeleton />
        <div className="grow p-8 bg-gray-50">
          <div className="h-9/10">
            <DocumentSkeleton className="bg-white mx-auto shadow-sm" />
          </div>
        </div>
      </div>
    );
  } else if (documentRegion === null) {
    return (
      <DocumentRegionStep
        pdfDocument={pdfDocument}
        backUrl="/documents"
        doneUrl={(documentRegion: DocumentRegion | null) => {
          const updatedSearchParams = new URLSearchParams(
            searchParams.toString()
          );
          if (documentRegion) {
            const { pageNumber, normalizedBoundingBox } = documentRegion;
            updatedSearchParams.set("pageNumber", pageNumber.toString());
            updatedSearchParams.set(
              "normalizedBoundingBox",
              JSON.stringify(normalizedBoundingBox)
            );
          }
          return `${pathname}?${updatedSearchParams}`;
        }}
      />
    );
  } else {
    const documentRegionStepUrlSearchParams = new URLSearchParams(
      searchParams.toString()
    );
    documentRegionStepUrlSearchParams.delete("pageNumber");
    documentRegionStepUrlSearchParams.delete("normalizedBoundingBox");
    const documentRegionStepUrl = `${pathname}?${documentRegionStepUrlSearchParams}`;
    return (
      <DocumentBoundaryStep
        documentId={documentId}
        pdfDocument={pdfDocument}
        documentRegion={documentRegion}
        backUrl={documentRegionStepUrl}
      />
    );
  }
}
