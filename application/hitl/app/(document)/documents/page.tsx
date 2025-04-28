import { buttonVariants } from "@/app/(document)/_components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/(document)/_components/ui/table";
import { getDocumentUseCase } from "@/app/(document)/_init";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DocumentsListing() {
  const documentUseCase = await getDocumentUseCase();
  const docs = await documentUseCase.getAll();
  return (
    <div className="max-w-2xl mx-auto p-8 flex flex-col gap-4">
      <h1 className="text-xl font-bold">Documents</h1>
      <Table aria-label="documents">
        <TableCaption>A read-only list of available documents</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead aria-label="document-id">ID</TableHead>
            <TableHead aria-label="document-name">Name</TableHead>
            <TableHead aria-label="actions">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {docs.map((document) => (
            <TableRow key={document.id} aria-label={document.name}>
              <TableCell aria-label="document-id">{document.id}</TableCell>
              <TableCell aria-label="document-name">{document.name}</TableCell>
              <TableCell aria-label="actions">
                <Link
                  href={`/documents/${document.id}`}
                  className={buttonVariants({ variant: "default" })}
                >
                  Label
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
