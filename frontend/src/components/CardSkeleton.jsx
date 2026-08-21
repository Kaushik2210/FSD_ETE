export default function CardSkeleton() {
  return (
    <div className="glass flex h-full flex-col gap-4 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="skeleton h-5 w-24 rounded-full" />
        <div className="skeleton h-8 w-8 rounded-full" />
      </div>
      <div className="skeleton h-5 w-3/4 rounded" />
      <div className="space-y-2">
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
      </div>
      <div className="flex gap-1.5">
        <div className="skeleton h-5 w-14 rounded-md" />
        <div className="skeleton h-5 w-16 rounded-md" />
        <div className="skeleton h-5 w-12 rounded-md" />
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-[var(--color-border)] pt-4">
        <div className="skeleton h-6 w-20 rounded-full" />
        <div className="skeleton h-8 w-14 rounded-full" />
      </div>
    </div>
  );
}
