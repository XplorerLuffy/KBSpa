import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-16">
      <Skeleton className="h-[70vh] rounded-none" />
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Skeleton className="mx-auto h-10 w-72" />
        <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-96 rounded-3xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
