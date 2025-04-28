import { getDocumentUseCase } from "@/app/(document)/_init";
import DocumentLabeller from "@/app/(document)/documents/[documentId]/DocumentLabeller";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
  const documentUseCase = await getDocumentUseCase();
  const rawDocument = await documentUseCase.getRawDocument(documentId);
  if (rawDocument === null) {
    notFound();
  }
  return (
    <DocumentLabeller
      documentId={documentId}
      rawDocumentUrl={rawDocument.url}
    ></DocumentLabeller>
  );
}
