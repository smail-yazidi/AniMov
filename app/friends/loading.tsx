import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function FriendsLoading() {
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

          {/* Search Skeleton */}
          <div className="max-w-md">
            <Skeleton className="h-10 w-full bg-white/10" />
          </div>
        </div>
      </header>

      {/* Tabs Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="w-full mb-6">
          <Skeleton className="h-10 w-full bg-white/10" />
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-12 w-12 rounded-full bg-white/10" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-1 bg-white/10" />
                    <Skeleton className="h-3 w-20 bg-white/10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full bg-white/10" />
                  <Skeleton className="h-3 w-3/4 bg-white/10" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-8 flex-1 bg-white/10" />
                    <Skeleton className="h-8 w-8 bg-white/10" />
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
