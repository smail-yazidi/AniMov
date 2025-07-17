"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Star, Calendar, Trash2, Filter, Play ,Search} from "lucide-react"
import { Sidebar } from "@/components/sidebar"

interface WatchlistItem {
  id: string
  title: string
  type: "movie" | "series" | "anime"
  poster: string
  rating: number
  year: number
  addedDate: string
  status: "plan-to-watch" | "watching" | "completed" | "on-hold" | "dropped"
  progress?: string
  genres: string[]
}

const mockWatchlist: WatchlistItem[] = [
  {
    id: "1",
    title: "Demon Slayer",
    type: "anime",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 8.7,
    year: 2019,
    addedDate: "2024-01-20",
    status: "watching",
    progress: "Episode 15/26",
    genres: ["Action", "Supernatural"],
  },
  {
    id: "2",
    title: "Dune",
    type: "movie",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 8.0,
    year: 2021,
    addedDate: "2024-01-18",
    status: "plan-to-watch",
    genres: ["Sci-Fi", "Adventure"],
  },
  {
    id: "3",
    title: "The Witcher",
    type: "series",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 8.2,
    year: 2019,
    addedDate: "2024-01-15",
    status: "on-hold",
    progress: "Season 1 Episode 5/8",
    genres: ["Fantasy", "Adventure"],
  },
  {
    id: "4",
    title: "Breaking Bad",
    type: "series",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 9.5,
    year: 2008,
    addedDate: "2024-01-12",
    status: "completed",
    progress: "Season 5 Complete",
    genres: ["Drama", "Crime"],
  },
  {
    id: "5",
    title: "Spirited Away",
    type: "anime",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 9.3,
    year: 2001,
    addedDate: "2024-01-10",
    status: "completed",
    progress: "Movie Complete",
    genres: ["Animation", "Family"],
  },
  {
    id: "6",
    title: "Inception",
    type: "movie",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 8.8,
    year: 2010,
    addedDate: "2024-01-08",
    status: "plan-to-watch",
    genres: ["Sci-Fi", "Thriller"],
  },
]

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(mockWatchlist)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")

  const filteredWatchlist = watchlist.filter((item) => {
    const statusMatch = selectedStatus === "all" || item.status === selectedStatus
    const typeMatch = selectedType === "all" || item.type === selectedType
    return statusMatch && typeMatch
  })

  const removeFromWatchlist = (id: string) => {
    setWatchlist(watchlist.filter((item) => item.id !== id))
  }

  const updateStatus = (id: string, newStatus: WatchlistItem["status"]) => {
    setWatchlist(watchlist.map((item) => (item.id === id ? { ...item, status: newStatus } : item)))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "plan-to-watch":
        return "bg-blue-600"
      case "watching":
        return "bg-green-600"
      case "completed":
        return "bg-purple-600"
      case "on-hold":
        return "bg-yellow-600"
      case "dropped":
        return "bg-red-600"
      default:
        return "bg-gray-600"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "plan-to-watch":
        return "Plan to Watch"
      case "watching":
        return "Watching"
      case "completed":
        return "Completed"
      case "on-hold":
        return "On Hold"
      case "dropped":
        return "Dropped"
      default:
        return status
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "movie":
        return "bg-blue-600"
      case "series":
        return "bg-green-600"
      case "anime":
        return "bg-purple-600"
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
      default:
        return type
    }
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
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
           
              >
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
                <Clock className="h-8 w-8 text-blue-500" />
                <div>
                  <h1 className="text-3xl font-bold text-white">Watchlist</h1>
                  <p className="text-gray-400">Track your entertainment progress</p>
                </div>
              </div>
              <Badge variant="outline" className="text-white border-white/20">
                {filteredWatchlist.length} items
              </Badge>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
              <Filter className="h-5 w-5 text-gray-400" />
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="plan-to-watch">Plan to Watch</SelectItem>
                  <SelectItem value="watching">Watching</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="dropped">Dropped</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="movie">Movies</SelectItem>
                  <SelectItem value="series">TV Series</SelectItem>
                  <SelectItem value="anime">Anime</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {filteredWatchlist.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No items in watchlist</h3>
              <p className="text-gray-400">Add content to your watchlist to track your progress</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredWatchlist.map((item) => (
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
                        <Badge className={`${getTypeColor(item.type)} text-white`}>{getTypeLabel(item.type)}</Badge>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <Badge className={`${getStatusColor(item.status)} text-white`}>
                          {getStatusLabel(item.status)}
                        </Badge>
                      </div>
                      <div className="absolute bottom-2 right-2 flex gap-1">

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromWatchlist(item.id)}
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
                      </div>
                      {item.progress && <p className="text-xs text-blue-400 mb-2">{item.progress}</p>}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {item.genres.slice(0, 2).map((genre, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                      <Select
                        value={item.status}
                        onValueChange={(value) => updateStatus(item.id, value as WatchlistItem["status"])}
                      >
                        <SelectTrigger className="w-full bg-white/5 border-white/10 text-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="plan-to-watch">Plan to Watch</SelectItem>
                          <SelectItem value="watching">Watching</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="on-hold">On Hold</SelectItem>
                          <SelectItem value="dropped">Dropped</SelectItem>
                        </SelectContent>
                      </Select>
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
