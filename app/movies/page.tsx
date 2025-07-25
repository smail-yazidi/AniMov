"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Search, Filter, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { tmdbApi, type Movie, getImageUrl } from "@/lib/tmdb-api"
import { Sidebar } from "@/components/sidebar"

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState("popularity.desc")
  const [genre, setGenre] = useState("")
  const [year, setYear] = useState("")

  const loadMovies = async (page = 1, search = "", sort = "popularity.desc") => {
    try {
      setLoading(true)
      let response

      if (search.trim()) {
        response = await tmdbApi.searchMovies(search, page)
      } else {
        response = await tmdbApi.getPopularMovies(page)
      }

      setMovies(response.results)
      setTotalPages(Math.min(response.total_pages, 500)) // TMDB limits to 500 pages
      setCurrentPage(page)
    } catch (error) {
      console.error("Error loading movies:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMovies(1, searchQuery, sortBy)
  }, [searchQuery, sortBy])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadMovies(1, searchQuery, sortBy)
  }

  const handlePageChange = (page: number) => {
    loadMovies(page, searchQuery, sortBy)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">

  <Sidebar />

      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 ml-12">
              <h1 className="text-2xl font-bold text-white">AniMov</h1>
            </div>

            <div className="flex items-center gap-4">
         

   
            </div>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Movies</h1>
          <p className="text-gray-300 text-lg">Discover the latest and greatest movies</p>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search movies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity.desc">Most Popular</SelectItem>
                    <SelectItem value="vote_average.desc">Highest Rated</SelectItem>
                    <SelectItem value="release_date.desc">Newest</SelectItem>
                    <SelectItem value="release_date.asc">Oldest</SelectItem>
                    <SelectItem value="title.asc">A-Z</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  <Filter className="h-4 w-4 mr-2" />
                  Apply
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Movies Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 20 }).map((_, i) => (
              <Card key={i} className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-0">
                  <Skeleton className="w-full h-72 bg-white/20 rounded-t-lg" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-white/20" />
                    <Skeleton className="h-3 w-1/2 bg-white/20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {movies.map((movie) => (
                <Link key={movie.id} href={`/item/movie-${movie.id}`}>
                  <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 group cursor-pointer">
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden rounded-t-lg">
                        <Image
                          src={getImageUrl(movie.poster_path) || "/placeholder.svg"}
                          alt={movie.title}
                          width={300}
                          height={450}
                          className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-yellow-500 text-black text-sm">
                            <Star className="h-3 w-3 mr-1" />
                            {movie.vote_average.toFixed(1)}
                          </Badge>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                          {movie.title}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : "TBA"}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        onClick={() => handlePageChange(pageNum)}
                        className={
                          currentPage === pageNum
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                        }
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* No Results */}
        {!loading && movies.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-white mb-2">No movies found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
