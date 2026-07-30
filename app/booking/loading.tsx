import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <div className="mb-12 flex flex-col items-center gap-4">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-80 max-w-full" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      <div className="flex flex-col gap-10">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {Array.from({ length: 7 }, (_, index) => (
            <Skeleton key={index} className="size-8 rounded-full" />
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
