
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Play, BookOpen, Tv, Film, Users, Heart, Clock, Search, Book, NotebookPen } from "lucide-react" // Added NotebookPen for S-Note
import Link from "next/link"
import Image from "next/image"
import { SearchModal } from "@/components/search-modal"
import { UserDropdown } from "@/components/user-dropdown"
import { tmdbApi, type Movie, type TVShow, getImageUrl } from "@/lib/tmdb-api"
import { jikanApi, type JikanAnime, type JikanManga } from "@/lib/jikan-api"
import { googleBooksApi, type GoogleBook, getBookImageUrl } from "@/lib/google-books-api"
import { Sidebar } from "@/components/sidebar"

const categories = [
  { id: "movies", name: "Movies", icon: Film, color: "bg-red-500", urlType: "movie" },
  { id: "series", name: "TV Series", icon: Tv, color: "bg-blue-500", urlType: "tv" },
  { id: "anime", name: "Anime", icon: Play, color: "bg-purple-500", urlType: "anime" },
  { id: "manga", name: "Manga", icon: BookOpen, color: "bg-orange-500", urlType: "manga" },
  { id: "books", name: "Books", icon: Book, color: "bg-green-500", urlType: "book" },
]

// Sample user stats
const userStats = {
  watchlistCount: 24,
  favoritesCount: 18,
  friendsCount: 12,
  sNoteCount: 7, // Added a sample count for S-Note
}

export default function HomePage() {
  const [currentCategory, setCurrentCategory] = useState(0)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [featuredContent, setFeaturedContent] = useState<{
    movies: Movie[]
    series: TVShow[]
    anime: JikanAnime[]
    manga: JikanManga[]
    books: GoogleBook[]
  }>({
    movies: [],
    series: [],
    anime: [],
    manga: [],
    books: [],
  })
  const [loading, setLoading] = useState(true)
  // Define a 'user' state to control the conditional rendering
  // For demonstration, let's assume 'null' means not logged in
  const [user, setUser] = useState(null); // Or use an auth hook to get the actual user object

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCategory((prev) => (prev + 1) % categories.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    loadFeaturedContent()
  }, [])

  const loadFeaturedContent = async () => {
    try {
      setLoading(true)

      // Load all featured content in parallel
      const [moviesData, seriesData, animeData, mangaData, booksData] = await Promise.all([
        tmdbApi.getPopularMovies(1),
        tmdbApi.getPopularTVShows(1),
        jikanApi.getTopAnime(1),
        jikanApi.getTopManga(1),
        googleBooksApi.getPopularBooks(0, 6),
      ])

      setFeaturedContent({
        movies: moviesData.results.slice(0, 6),
        series: seriesData.results.slice(0, 6),
        anime: animeData.data.slice(0, 6),
        manga: mangaData.data.slice(0, 6),
        books: booksData.items?.slice(0, 6) || [],
      })
    } catch (error) {
      console.error("Error loading featured content:", error)
    } finally {
      setLoading(false)
    }
  }

  const currentCategoryData = categories[currentCategory]
  const getCurrentContent = () => {
    switch (currentCategoryData.id) {
      case "movies":
        return featuredContent.movies.map((item) => ({
          id: item.id,
          title: item.title,
          rating: item.vote_average,
          year: item.release_date ? new Date(item.release_date).getFullYear() : null,
          image: getImageUrl(item.poster_path),
          urlType: "movie",
        }))
      case "series":
        return featuredContent.series.map((item) => ({
          id: item.id,
          title: item.name,
          rating: item.vote_average,
          year: item.first_air_date ? new Date(item.first_air_date).getFullYear() : null,
          image: getImageUrl(item.poster_path),
          urlType: "tv",
        }))
      case "anime":
        return featuredContent.anime.map((item) => ({
          id: item.mal_id,
          title: item.title_english || item.title,
          rating: item.score || 0,
          year: item.year,
          image: item.images.jpg.large_image_url || item.images.jpg.image_url,
          urlType: "anime",
        }))
      case "manga":
        return featuredContent.manga.map((item) => ({
          id: item.mal_id,
          title: item.title_english || item.title,
          rating: item.score || 0,
          year: item.published.prop.from.year,
          image: item.images.jpg.large_image_url || item.images.jpg.image_url,
          urlType: "manga",
        }))
      case "books":
        return featuredContent.books.map((item) => ({
          id: item.id,
          title: item.volumeInfo.title,
          rating: item.volumeInfo.averageRating || 0,
          year: item.volumeInfo.publishedDate ? new Date(item.volumeInfo.publishedDate).getFullYear() : null,
          image: getBookImageUrl(item),
          urlType: "book",
        }))
      default:
        return []
    }
  }

  const currentContent = getCurrentContent()

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

              {/* UserDropdown would typically receive the 'user' prop */}
              <UserDropdown user={user} />
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Quick Navigation Buttons with Counters (Conditionally Rendered if user is NOT logged in) */}
      {!user && ( // Corrected conditional rendering: using logical AND (&&)
        <section className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/watchlist" className="flex-1 max-w-sm">
              <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 group cursor-pointer">
                <CardContent className="p-6 text-center relative">
                  {/* Counter Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white/20 text-white border-0 text-xs px-2 py-1">
                      {userStats.watchlistCount}
                    </Badge>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">Watchlist</h3>
                  <p className="text-blue-100 text-sm">Your saved content</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/favorites" className="flex-1 max-w-sm">
              <Card className="bg-gradient-to-r from-pink-600 to-pink-700 border-0 hover:from-pink-700 hover:to-pink-800 transition-all duration-300 group cursor-pointer">
                <CardContent className="p-6 text-center relative">
                  {/* Counter Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white/20 text-white border-0 text-xs px-2 py-1">
                      {userStats.favoritesCount}
                    </Badge>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">Favorites</h3>
                  <p className="text-pink-100 text-sm">Your loved content</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/friends" className="flex-1 max-w-sm">
              <Card className="bg-gradient-to-r from-green-600 to-green-700 border-0 hover:from-green-700 hover:to-green-800 transition-all duration-300 group cursor-pointer">
                <CardContent className="p-6 text-center relative">
                  {/* Counter Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white/20 text-white border-0 text-xs px-2 py-1">{userStats.friendsCount}</Badge>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">Friends</h3>
                  <p className="text-green-100 text-sm">Connect & share</p>
                </CardContent>
              </Card>
            </Link>

            {/* Added S-Note Link */}
            <Link href="/s-note" className="flex-1 max-w-sm">
              <Card className="bg-gradient-to-r from-purple-600 to-purple-700 border-0 hover:from-purple-700 hover:to-purple-800 transition-all duration-300 group cursor-pointer">
                <CardContent className="p-6 text-center relative">
                  {/* Counter Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white/20 text-white border-0 text-xs px-2 py-1">
                      {userStats.sNoteCount} {/* Using the new sNoteCount */}
                    </Badge>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <NotebookPen className="h-8 w-8 text-white" /> {/* S-Note icon */}
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">S-Notes</h3>
                  <p className="text-purple-100 text-sm">Your secure notes</p>
                </CardContent>
              </Card>
            </Link>

          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">Discover Entertainment</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Movies, TV Series, Anime, Manga, and Books - Everything you need in one place
          </p>
        </div>

        {/* Category Indicators */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setCurrentCategory(index)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  index === currentCategory
                    ? `${category.color} text-white shadow-lg scale-110`
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="hidden sm:inline">{category.name}</span>
              </button>
            )
          })}
        </div>

        {/* Featured Content */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Featured {currentCategoryData.name}</h3>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardContent className="p-0">
                    <div className="w-full h-64 bg-white/20 animate-pulse rounded-t-lg" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-white/20 animate-pulse rounded" />
                      <div className="h-3 bg-white/20 animate-pulse rounded w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {currentContent.map((item) => (
                <Link key={item.id} href={`/item/${item.urlType}-${item.id}`}>
                  <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 group cursor-pointer">
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden rounded-t-lg">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          width={200}
                          height={300}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-yellow-500 text-black">
                            <Star className="h-3 w-3 mr-1" />
                            {item.rating ? item.rating.toFixed(1) : "N/A"}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-white mb-2 line-clamp-2">{item.title}</h4>
                        <p className="text-gray-400 text-sm mb-3">{item.year || "Unknown"}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Category Grid - Mobile Friendly Vertical Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Link key={category.id} href={`/${category.id}`}>
                <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 group cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div
                      className={`${category.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-2">{category.name}</h3>
                    <p className="text-gray-400 text-sm">Explore Collection</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
