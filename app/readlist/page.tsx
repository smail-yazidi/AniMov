"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Star, Calendar, Trash2, Filter, Play ,Search} from "lucide-react"
import { Sidebar } from "@/components/sidebar"

interface ReadlistItem {
  id: string
  title: string
  type: "manga" | "book"
  poster: string
  rating: number
  year: number
  addedDate: string
  status: "plan-to-read" | "reading" | "completed" | "on-hold" | "dropped"
  progress?: string
  genres: string[]
}

const mockReadlist: ReadlistItem[] = [
  {
    id: "1",
    title: "Attack on Titan",
    type: "manga",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 9.0,
    year: 2009,
    addedDate: "2024-01-20",
    status: "reading",
    progress: "Chapter 120/139",
    genres: ["Action", "Drama"],
  },
  {
    id: "2",
    title: "The Hobbit",
    type: "book",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 8.5,
    year: 1937,
    addedDate: "2024-01-18",
    status: "plan-to-read",
    genres: ["Fantasy", "Adventure"],
  },
  {
    id: "3",
    title: "One Piece",
    type: "manga",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 9.2,
    year: 1997,
    addedDate: "2024-01-15",
    status: "reading",
    progress: "Chapter 1050/1100+",
    genres: ["Adventure", "Comedy"],
  },
  {
    id: "4",
    title: "Dune",
    type: "book",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 8.8,
    year: 1965,
    addedDate: "2024-01-12",
    status: "completed",
    progress: "Finished",
    genres: ["Sci-Fi", "Adventure"],
  },
  {
    id: "5",
    title: "Chainsaw Man",
    type: "manga",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 8.9,
    year: 2018,
    addedDate: "2024-01-10",
    status: "completed",
    progress: "Chapter 97/97",
    genres: ["Action", "Horror"],
  },
  {
    id: "6",
    title: "1984",
    type: "book",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 8.7,
    year: 1949,
    addedDate: "2024-01-08",
    status: "on-hold",
    progress: "Page 150/328",
    genres: ["Dystopian", "Political"],
  },
]

export default function ReadlistPage() {
  const [readlist, setReadlist] = useState<ReadlistItem[]>(mockReadlist)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")

  const filteredReadlist = readlist.filter((item) => {
    const statusMatch = selectedStatus === "all" || item.status === selectedStatus
    const typeMatch = selectedType === "all" || item.type === selectedType
    return statusMatch && typeMatch
  })

  const removeFromReadlist = (id: string) => {
    setReadlist(readlist.filter((item) => item.id !== id))
  }

  const updateStatus = (id: string, newStatus: ReadlistItem["status"]) => {
    setReadlist(readlist.map((item) => (item.id === id ? { ...item, status: newStatus } : item)))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "plan-to-read":
        return "bg-blue-600"
      case "reading":
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
      case "plan-to-read":
        return "Plan to Read"
      case "reading":
        return "Reading"
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
      case "manga":
        return "Manga"
      case "book":
        return "Book"
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
                <BookOpen className="h-8 w-8 text-orange-500" />
                <div>
                  <h1 className="text-3xl font-bold text-white">Readlist</h1>
                  <p className="text-gray-400">Track your reading progress</p>
                </div>
              </div>
              <Badge variant="outline" className="text-white border-white/20">
                {filteredReadlist.length} items
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
                  <SelectItem value="plan-to-read">Plan to Read</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
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
                  <SelectItem value="manga">Manga</SelectItem>
                  <SelectItem value="book">Books</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {filteredReadlist.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No items in readlist</h3>
              <p className="text-gray-400">Add books and manga to your readlist to track your progress</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredReadlist.map((item) => (
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
                          onClick={() => removeFromReadlist(item.id)}
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
                        onValueChange={(value) => updateStatus(item.id, value as ReadlistItem["status"])}
                      >
                        <SelectTrigger className="w-full bg-white/5 border-white/10 text-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="plan-to-read">Plan to Read</SelectItem>
                          <SelectItem value="reading">Reading</SelectItem>
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
