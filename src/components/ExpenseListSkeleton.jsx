export default function ExpenseListSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl animate-pulse"
        >
          <div className="w-12 h-12 bg-gray-200 rounded-xl" />

          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-100 rounded w-1/4" />
          </div>

          <div className="h-5 bg-gray-200 rounded w-16" />
        </div>
      ))}
    </div>
  );
}