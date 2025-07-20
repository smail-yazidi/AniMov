"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Star, Calendar, Trash2, Filter, Search } from "lucide-react"
import { Sidebar } from "@/components/sidebar"

interface FavoriteItem {
  id: string
  title: string
  type: "movie" | "series" | "anime" | "manga" | "book"
  poster: string
  rating: number
  year: number
  addedDate: string
  genres: string[]
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [selectedType, setSelectedType] = useState<string>("all")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFavorites() {
      try {
        setLoading(true)
        setError(null)

        // Replace the URL with your actual API endpoint
        const response = await fetch("/api/favorites")
        if (!response.ok) {
          throw new Error(`Failed to fetch favorites: ${response.statusText}`)
        }
        const data: FavoriteItem[] = await response.json()
        setFavorites(data)
      } catch (err: any) {
        setError(err.message || "Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [])

  const filteredFavorites = favorites.filter(
    (item) => selectedType === "all" || item.type === selectedType
  )

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id))
    // Optionally call an API to remove favorite from backend here
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "movie":
        return "bg-blue-600"
      case "series":
        return "bg-green-600"
      case "anime":
        return "bg-purple-600"
      case "manga":
        return "bg-orange-600"
      case "book":
        return "bg-red-600"
      default:
        return "bg-gray-600"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "movie":
        return "Movie"
      case "series":
        return "TV Series"
      case "anime":
        return "Anime"
      case "manga":
        return "Manga"
      case "book":
        return "Book"
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading favorites...
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error: {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      <Sidebar />

      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 ml-12">
              <h1 className="text-2xl font-bold text-white">AniMov</h1>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-black/20 backdrop-blur-md border-b border-white/10 pt-20 pb-6">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Heart className="h-8 w-8 text-red-500 fill-red-500" />
                <div>
                  <h1 className="text-3xl font-bold text-white">Favorites</h1>
                  <p className="text-gray-400">Your favorite entertainment content</p>
                </div>
              </div>
              <Badge variant="outline" className="text-white border-white/20">
                {filteredFavorites.length} items
              </Badge>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-gray-400" />
              <div className="flex gap-2">
                {["all", "movie", "series", "anime", "manga", "book"].map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                    className={
                      selectedType === type
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                    }
                  >
                    {type === "all" ? "All" : getTypeLabel(type)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {filteredFavorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No favorites yet</h3>
              <p className="text-gray-400">Start adding your favorite content to see them here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredFavorites.map((item) => (
                <Card
                  key={item.id}
                  className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 group"
                >
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={item.poster || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-yellow-500 text-black">
                          <Star className="h-3 w-3 mr-1" />
                          {item.rating.toFixed(1)}
                        </Badge>
                      </div>
                      <div className="absolute top-2 left-2">
                        <Badge className={`${getTypeColor(item.type)} text-white`}>
                          {getTypeLabel(item.type)}
                        </Badge>
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFavorite(item.id)}
                          className="bg-red-600 hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-white mb-2 line-clamp-2">{item.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {item.year}
                        </div>
                        <div className="text-xs">Added {new Date(item.addedDate).toLocaleDateString()}</div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.genres.slice(0, 2).map((genre, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
