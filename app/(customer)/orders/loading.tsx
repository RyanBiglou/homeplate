import { Skeleton } from "@/components/ui/skeleton";

export default function OrdersLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-2 h-4 w-24" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </main>
  );
}
