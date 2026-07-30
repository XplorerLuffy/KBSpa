import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-5">
        <Skeleton className="size-16 rounded-full" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      <Skeleton className="mt-10 h-72 rounded-3xl" />

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Skeleton className="h-13 w-full rounded-full sm:w-52" />
        <Skeleton className="h-13 w-full rounded-full sm:w-52" />
      </div>
    </div>
  );
}
