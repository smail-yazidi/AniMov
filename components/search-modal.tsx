"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Film, Tv, Play, BookOpen, Book } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { tmdbApi } from "@/lib/tmdb-api"
import { jikanApi } from "@/lib/jikan-api"
import { googleBooksApi } from "@/lib/google-books-api"

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState({
    movies: [],
    tv: [],
    anime: [],
    manga: [],
    books: [],
  })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("movies")

  useEffect(() => {
    if (searchTerm.trim()) {
      const delayedSearch = setTimeout(() => {
        handleSearch()
      }, 500)
      return () => clearTimeout(delayedSearch)
    } else {
      setResults({ movies: [], tv: [], anime: [], manga: [], books: [] })
    }
  }, [searchTerm])

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setLoading(true)
    try {
      const [moviesData, tvData, animeData, mangaData, booksData] = await Promise.allSettled([
        tmdbApi.searchMovies(searchTerm, 1),
        tmdbApi.searchTVShows(searchTerm, 1),
        jikanApi.searchAnime(searchTerm, 1),
        jikanApi.searchManga(searchTerm, 1),
        googleBooksApi.searchBooks(searchTerm, 1),
      ])

      setResults({
        movies: moviesData.status === "fulfilled" ? moviesData.value.results.slice(0, 6) : [],
        tv: tvData.status === "fulfilled" ? tvData.value.results.slice(0, 6) : [],
        anime: animeData.status === "fulfilled" ? animeData.value.data.slice(0, 6) : [],
        manga: mangaData.status === "fulfilled" ? mangaData.value.data.slice(0, 6) : [],
        books: booksData.status === "fulfilled" ? (booksData.value.items || []).slice(0, 6) : [],
      })
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSearchTerm("")
    setResults({ movies: [], tv: [], anime: [], manga: [], books: [] })
    onClose()
  }

  const renderMovieResults = (movies: any[]) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {movies.map((movie) => (
        <Link key={movie.id} href={`/item/movie-${movie.id}`} onClick={handleClose}>
          <div className="bg-white/10 rounded-lg p-3 hover:bg-white/20 hover:border-purple-500/50 transition-colors cursor-pointer">
            <div className="flex gap-3">
              <Image
                src={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                    : "/placeholder.svg?height=120&width=80"
                }
                alt={movie.title}
                width={60}
                height={90}
                className="rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm line-clamp-2">{movie.title}</h4>
                <p className="text-gray-400 text-xs">
                  {movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}
                </p>
                <Badge variant="outline" className="text-xs mt-1">
                  ⭐ {movie.vote_average?.toFixed(1)}
                </Badge>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )

  const renderTVResults = (shows: any[]) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {shows.map((show) => (
        <Link key={show.id} href={`/item/tv-${show.id}`} onClick={handleClose}>
          <div className="bg-white/10 rounded-lg p-3 hover:bg-white/20 hover:border-purple-500/50 transition-colors cursor-pointer">
            <div className="flex gap-3">
              <Image
                src={
                  show.poster_path
                    ? `https://image.tmdb.org/t/p/w200${show.poster_path}`
                    : "/placeholder.svg?height=120&width=80"
                }
                alt={show.name}
                width={60}
                height={90}
                className="rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm line-clamp-2">{show.name}</h4>
                <p className="text-gray-400 text-xs">
                  {show.first_air_date ? new Date(show.first_air_date).getFullYear() : "N/A"}
                </p>
                <Badge variant="outline" className="text-xs mt-1">
                  ⭐ {show.vote_average?.toFixed(1)}
                </Badge>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )

  const renderAnimeResults = (anime: any[]) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {anime.map((item) => (
        <Link key={item.mal_id} href={`/item/anime-${item.mal_id}`} onClick={handleClose}>
          <div className="bg-white/10 rounded-lg p-3 hover:bg-white/20 hover:border-purple-500/50 transition-colors cursor-pointer">
            <div className="flex gap-3">
              <Image
                src={item.images?.jpg?.image_url || "/placeholder.svg?height=120&width=80"}
                alt={item.title}
                width={60}
                height={90}
                className="rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm line-clamp-2">{item.title}</h4>
                <p className="text-gray-400 text-xs">
                  {item.aired?.from ? new Date(item.aired.from).getFullYear() : "N/A"}
                </p>
                <Badge variant="outline" className="text-xs mt-1">
                  ⭐ {item.score?.toFixed(1) || "N/A"}
                </Badge>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )

  const renderMangaResults = (manga: any[]) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {manga.map((item) => (
        <Link key={item.mal_id} href={`/item/manga-${item.mal_id}`} onClick={handleClose}>
          <div className="bg-white/10 rounded-lg p-3 hover:bg-white/20 hover:border-purple-500/50 transition-colors cursor-pointer">
            <div className="flex gap-3">
              <Image
                src={item.images?.jpg?.image_url || "/placeholder.svg?height=120&width=80"}
                alt={item.title}
                width={60}
                height={90}
                className="rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm line-clamp-2">{item.title}</h4>
                <p className="text-gray-400 text-xs">
                  {item.published?.from ? new Date(item.published.from).getFullYear() : "N/A"}
                </p>
                <Badge variant="outline" className="text-xs mt-1">
                  ⭐ {item.score?.toFixed(1) || "N/A"}
                </Badge>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )

  const renderBookResults = (books: any[]) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {books.map((book) => (
        <Link key={book.id} href={`/item/book-${book.id}`} onClick={handleClose}>
          <div className="bg-white/10 rounded-lg p-3 hover:bg-white/20 hover:border-purple-500/50 transition-colors cursor-pointer">
            <div className="flex gap-3">
              <Image
                src={
                  book.volumeInfo.imageLinks?.thumbnail?.replace("http://", "https://") ||
                  "/placeholder.svg?height=120&width=80" ||
                  "/placeholder.svg" ||
                  "/placeholder.svg" ||
                  "/placeholder.svg"
                }
                alt={book.volumeInfo.title}
                width={60}
                height={90}
                className="rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm line-clamp-2">{book.volumeInfo.title}</h4>
                <p className="text-gray-400 text-xs">{book.volumeInfo.authors?.join(", ") || "Unknown Author"}</p>
                {book.volumeInfo.averageRating && (
                  <Badge variant="outline" className="text-xs mt-1">
                    ⭐ {book.volumeInfo.averageRating.toFixed(1)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )

  const getResultCount = (category: string) => {
    return results[category as keyof typeof results]?.length || 0
  }

  return (
 <Dialog open={isOpen} onOpenChange={handleClose}>
  <DialogContent className="max-w-4xl max-h-[80vh] bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-md border-white/20 flex flex-col">
    <DialogHeader>
      <DialogTitle className="text-white flex items-center gap-2">
        <Search className="h-5 w-5" />
        Search Content
      </DialogTitle>
    </DialogHeader>

    <div className="flex flex-col flex-1 overflow-hidden space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
    <Input
  placeholder="Search movies, TV shows, anime, manga, books..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="pl-10 bg-white/10 backdrop-blur-md border-none text-white placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500"
  autoFocus
/>

      </div>

      {searchTerm.trim() ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-5 bg-white/10 backdrop-blur-md">
            <TabsTrigger value="movies" className="flex items-center justify-center gap-1 p-1 sm:p-2">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <Film className="h-4 w-4 sm:h-3 sm:w-3" />
                <span className="hidden sm:inline text-xs">Movies</span>
                <span className="hidden sm:inline text-xs">({getResultCount("movies")})</span>
              </div>
            </TabsTrigger>
            
            <TabsTrigger value="tv" className="flex items-center justify-center gap-1 p-1 sm:p-2">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <Tv className="h-4 w-4 sm:h-3 sm:w-3" />
                <span className="hidden sm:inline text-xs">TV</span>
                <span className="hidden sm:inline text-xs">({getResultCount("tv")})</span>
              </div>
            </TabsTrigger>
            
            <TabsTrigger value="anime" className="flex items-center justify-center gap-1 p-1 sm:p-2">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <Play className="h-4 w-4 sm:h-3 sm:w-3" />
                <span className="hidden sm:inline text-xs">Anime</span>
                <span className="hidden sm:inline text-xs">({getResultCount("anime")})</span>
              </div>
            </TabsTrigger>
            
            <TabsTrigger value="manga" className="flex items-center justify-center gap-1 p-1 sm:p-2">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <BookOpen className="h-4 w-4 sm:h-3 sm:w-3" />
                <span className="hidden sm:inline text-xs">Manga</span>
                <span className="hidden sm:inline text-xs">({getResultCount("manga")})</span>
              </div>
            </TabsTrigger>
            
            <TabsTrigger value="books" className="flex items-center justify-center gap-1 p-1 sm:p-2">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <Book className="h-4 w-4 sm:h-3 sm:w-3" />
                <span className="hidden sm:inline text-xs">Books</span>
                <span className="hidden sm:inline text-xs">({getResultCount("books")})</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="movies" className="h-full">
              {loading ? (
                <div className="text-center py-8 text-gray-400">Searching movies...</div>
              ) : results.movies.length > 0 ? (
                <div className="space-y-4 pb-4">
                  {renderMovieResults(results.movies)}
                  <div className="text-center">
                    <Link href={`/movies?search=${encodeURIComponent(searchTerm)}`} onClick={handleClose}>
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white border-0" size="sm">
                        View All Movie Results
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">No movies found</div>
              )}
            </TabsContent>

            <TabsContent value="tv" className="h-full">
              {loading ? (
                <div className="text-center py-8 text-gray-400">Searching TV shows...</div>
              ) : results.tv.length > 0 ? (
                <div className="space-y-4 pb-4">
                  {renderTVResults(results.tv)}
                  <div className="text-center">
                    <Link href={`/series?search=${encodeURIComponent(searchTerm)}`} onClick={handleClose}>
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white border-0" size="sm">
                        View All TV Results
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">No TV shows found</div>
              )}
            </TabsContent>

            <TabsContent value="anime" className="h-full">
              {loading ? (
                <div className="text-center py-8 text-gray-400">Searching anime...</div>
              ) : results.anime.length > 0 ? (
                <div className="space-y-4 pb-4">
                  {renderAnimeResults(results.anime)}
                  <div className="text-center">
                    <Link href={`/anime?search=${encodeURIComponent(searchTerm)}`} onClick={handleClose}>
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white border-0" size="sm">
                        View All Anime Results
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">No anime found</div>
              )}
            </TabsContent>

            <TabsContent value="manga" className="h-full">
              {loading ? (
                <div className="text-center py-8 text-gray-400">Searching manga...</div>
              ) : results.manga.length > 0 ? (
                <div className="space-y-4 pb-4">
                  {renderMangaResults(results.manga)}
                  <div className="text-center">
                    <Link href={`/manga?search=${encodeURIComponent(searchTerm)}`} onClick={handleClose}>
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white border-0" size="sm">
                        View All Manga Results
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">No manga found</div>
              )}
            </TabsContent>

            <TabsContent value="books" className="h-full">
              {loading ? (
                <div className="text-center py-8 text-gray-400">Searching books...</div>
              ) : results.books.length > 0 ? (
                <div className="space-y-4 pb-4">
                  {renderBookResults(results.books)}
                  <div className="text-center">
                    <Link href={`/books?search=${encodeURIComponent(searchTerm)}`} onClick={handleClose}>
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white border-0" size="sm">
                        View All Book Results
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">No books found</div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Start typing to search across movies, TV shows, anime, manga, and books
        </div>
      )}
    </div>
  </DialogContent>
</Dialog>
  )
}
