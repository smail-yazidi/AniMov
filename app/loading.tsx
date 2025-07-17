import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
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
        </div>
      </header>

      {/* Hero Section Skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Skeleton className="h-12 w-96 mx-auto mb-4 bg-white/10" />
          <Skeleton className="h-6 w-64 mx-auto bg-white/10" />
        </div>

        {/* Featured Content Skeleton */}
        <div className="mb-12">
          <Skeleton className="h-8 w-48 mb-6 bg-white/10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
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

        {/* Categories Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6 text-center">
                <Skeleton className="h-8 w-8 mx-auto mb-3 bg-white/10" />
                <Skeleton className="h-4 w-16 mx-auto mb-2 bg-white/10" />
                <Skeleton className="h-3 w-12 mx-auto bg-white/10" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
