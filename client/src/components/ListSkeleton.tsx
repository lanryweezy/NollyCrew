export default function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 animate-pulse">
          <div className="h-4 bg-muted rounded w-1/3 mb-3" />
          <div className="h-3 bg-muted rounded w-2/3 mb-2" />
          <div className="h-3 bg-muted rounded w-1/2" />
          <div className="mt-4 h-8 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}


