import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-36 pb-24 sm:px-6 lg:px-8">
      <Skeleton className="mx-auto h-4 w-40" />
      <Skeleton className="mx-auto mt-5 h-12 w-80" />
      <Skeleton className="mx-auto mt-4 h-4 w-full max-w-xl" />
      <div className="mt-16 flex gap-2">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-11 w-28 rounded-full" />
        ))}
      </div>
      <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-96 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
