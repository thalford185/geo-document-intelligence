import { getDocumentBoundaryUseCase } from "@/app/(document)/_init";
import { parseZodJSONString } from "@/app/(document)/_lib/zod";
import { NextRequest } from "next/server";
import { z } from "zod";

const boundingBoxDtoSchema = z.tuple([
  z.number(),
  z.number(),
  z.number(),
  z.number(),
]);
const partialBoundaryDtoSchema = z.array(z.tuple([z.number(), z.number()]));
const searchParamsSchema = z.object({
  boundingBox: z
    .string()
    .transform(parseZodJSONString)
    .pipe(boundingBoxDtoSchema),
  pageNumber: z.coerce.number(),
  partialBoundary: z
    .string()
    .transform(parseZodJSONString)
    .pipe(partialBoundaryDtoSchema),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const documentBoundaryUseCase = await getDocumentBoundaryUseCase();
  const { documentId } = await params;
  const {
    boundingBox: normalizedBoundingBox,
    pageNumber,
    partialBoundary: partialBoundaryNormalizedVertices,
  } = searchParamsSchema.parse({
    boundingBox: request.nextUrl.searchParams.get("boundingBox"),
    pageNumber: request.nextUrl.searchParams.get("pageNumber"),
    partialBoundary: request.nextUrl.searchParams.get("partialBoundary"),
  });
  if (partialBoundaryNormalizedVertices.length < 2) {
    const boundary = await documentBoundaryUseCase.getBoundary(documentId, {
      pageNumber,
      normalizedBoundingBox,
    });
    return Response.json(boundary);
  } else {
    const completedBoundary = await documentBoundaryUseCase.getBoundaryCompletion(
      documentId,
      {
        pageNumber,
        normalizedBoundingBox,
      },
      { normalizedVertices: partialBoundaryNormalizedVertices }
    );
    return Response.json(completedBoundary);
  }
}
