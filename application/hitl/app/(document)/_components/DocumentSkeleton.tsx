import { Skeleton } from "@/app/(document)/_components/ui/skeleton";

interface DocumentSkeletonProps {
  className?: string;
}
export default function DocumentSkeleton(props: DocumentSkeletonProps) {
  const { className } = props;
  return (
    <div
      className={`bg-white max-w-full max-h-full aspect-[210/297] flex flex-col gap-4 p-4 ${
        className || ""
      }`}
      aria-busy
    >
      <Skeleton className="h-8 rounded-xl"></Skeleton>
      <Skeleton className="h-4 rounded-xl"></Skeleton>
      <Skeleton className="h-4 rounded-xl"></Skeleton>
      <Skeleton className="h-4 w-[67%] rounded-xl"></Skeleton>
      <Skeleton className="h-128 aspect-square rounded-xl"></Skeleton>
      <Skeleton className="h-4 rounded-xl"></Skeleton>
      <Skeleton className="h-4 w-[33%] rounded-xl"></Skeleton>
    </div>
  );
}
