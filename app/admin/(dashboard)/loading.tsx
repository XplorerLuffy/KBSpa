import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-24 rounded-3xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-3xl" />
    </div>
  );
}
