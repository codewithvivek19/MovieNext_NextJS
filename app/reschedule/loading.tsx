export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <div className="animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4 mx-auto mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="h-64 bg-muted rounded"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    </div>
  )
}

