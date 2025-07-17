import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function AnimeLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header Skeleton */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 pt-20 pb-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-lg bg-white/10" />
              <div>
                <Skeleton className="h-8 w-32 mb-2 bg-white/10" />
                <Skeleton className="h-4 w-48 bg-white/10" />
              </div>
            </div>
            <Skeleton className="h-10 w-32 bg-white/10" />
          </div>

          {/* Filter Skeleton */}
          <div className="flex items-center gap-4 flex-wrap">
            <Skeleton className="h-5 w-5 bg-white/10" />
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-20 bg-white/10" />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Content Grid Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 20 }).map((_, i) => (
            <Card key={i} className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-0">
                <Skeleton className="w-full h-64 rounded-t-lg bg-white/10" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-full bg-white/10" />
                  <Skeleton className="h-3 w-3/4 bg-white/10" />
                  <div className="flex gap-1">
                    <Skeleton className="h-5 w-12 bg-white/10" />
                    <Skeleton className="h-5 w-16 bg-white/10" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
