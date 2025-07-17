"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Search, Filter, Calendar, Play } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { jikanApi, type JikanAnime } from "@/lib/jikan-api"
import { Sidebar } from "@/components/sidebar"

export default function AnimePage() {
  const [anime, setAnime] = useState<JikanAnime[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState("score")
  const [type, setType] = useState("tv")
  const [status, setStatus] = useState("airing")

  const loadAnime = async (page = 1, search = "") => {
    try {
      setLoading(true)
      let response

      if (search.trim()) {
        response = await jikanApi.searchAnime(search, page, {
          type: type || undefined,
          status: status || undefined,
          order_by: sortBy,
          sort: "desc",
        })
      } else {
        response = await jikanApi.getTopAnime(page, type || undefined)
      }

      setAnime(response.data)
      setTotalPages(response.pagination.last_visible_page)
      setCurrentPage(page)
    } catch (error) {
      console.error("Error loading anime:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnime(1, searchQuery)
  }, [searchQuery, sortBy, type, status])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadAnime(1, searchQuery)
  }

  const handlePageChange = (page: number) => {
    loadAnime(page, searchQuery)
    window.scrollTo({ top: 0, behavior: "smooth" })
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
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>

   
            </div>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Anime</h1>
          <p className="text-gray-300 text-lg">Discover the best anime series and movies</p>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search anime..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  <Filter className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score">Highest Rated</SelectItem>
                    <SelectItem value="popularity">Most Popular</SelectItem>
                    <SelectItem value="start_date">Newest</SelectItem>
                    <SelectItem value="title">A-Z</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tv">TV Series</SelectItem>
                    <SelectItem value="movie">Movie</SelectItem>
                    <SelectItem value="ova">OVA</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                    <SelectItem value="ona">ONA</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="airing">Currently Airing</SelectItem>
                    <SelectItem value="complete">Completed</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Anime Grid */}
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
              {anime.map((item) => (
                <Link key={item.mal_id} href={`/item/anime-${item.mal_id}`}>
                  <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 group cursor-pointer">
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden rounded-t-lg">
                        <Image
                          src={item.images.jpg.large_image_url || item.images.jpg.image_url || "/placeholder.svg"}
                          alt={item.title}
                          width={300}
                          height={450}
                          className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {item.score && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-yellow-500 text-black text-sm">
                              <Star className="h-3 w-3 mr-1" />
                              {item.score.toFixed(1)}
                            </Badge>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                          {item.title_english || item.title}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{item.year || "TBA"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Play className="h-3 w-3" />
                            <span>{item.type}</span>
                          </div>
                        </div>
                        {item.episodes && <div className="text-xs text-gray-400 mt-1">{item.episodes} episodes</div>}
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
        {!loading && anime.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-white mb-2">No anime found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
