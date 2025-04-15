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
      <p className="text-xl font-bold">Documents</p>
      <Table>
        <TableCaption>A read-only list of available documents</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {docs.map((document) => (
            <TableRow key={document.id}>
              <TableCell>{document.id}</TableCell>
              <TableCell>{document.name}</TableCell>
              <TableCell>
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
