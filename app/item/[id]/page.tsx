"use client"
import { useRouter } from 'next/navigation'; // Import useRouter

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"; // Or sometimes "@/components/ui/toast"
import {
  Star,
  Heart,BookOpen,Eye,
  Clock,
  ArrowLeft,
  Play,
  Share2,
  MessageCircle,
  ThumbsUp,
  Film,
  Tv,
  Info,
  Calendar,
  DollarSign,Book
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import {
  tmdbApi,
  type MovieDetails,
  type TVShowDetails,
  type Cast,
  type Crew,
  type Movie,
  type TVShow,
  getImageUrl,
} from "@/lib/tmdb-api"
import { jikanApi, type JikanAnime, type JikanManga } from "@/lib/jikan-api"
import { googleBooksApi, type GoogleBook, getBookImageUrl, getBookDescription } from "@/lib/google-books-api"
import { Sidebar } from "@/components/sidebar"

// Sample friends comments (you can replace this with real data later)
const friendsComments = [
  {
    id: 1,
    user: "Ahmed Mohamed",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 9,
    comment: "Absolutely amazing! The action sequences were incredible and the story kept me engaged throughout.",
    date: "2024-01-15",
    likes: 12,
  },
  {
    id: 2,
    user: "Sarah Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 8,
    comment: "Great movie with excellent cinematography. The characters were well developed and the plot was engaging.",
    date: "2024-01-14",
    likes: 8,
  },
]

export default function ItemDetailPage() {
  const params = useParams()
  const [item, setItem] = useState<MovieDetails | TVShowDetails | JikanAnime | JikanManga | GoogleBook | null>(null)
  const [credits, setCredits] = useState<{ cast: Cast[]; crew: Crew[] } | null>(null)
  const [similarItems, setSimilarItems] = useState<(Movie | TVShow)[]>([])
  const [loading, setLoading] = useState(true)
  const [userRating, setUserRating] = useState(0)
  const [userComment, setUserComment] = useState("")
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [isInFavorites, setIsInFavorites] = useState(false)
  const [isInReadingList, setIsInReadingList] = useState(false)
  const router = useRouter();


  const itemId = params.id as string
  const [type, id] = itemId.split("-")
useEffect(() => {
  const checkIfInFavorites = async () => {
    const contentId = getContentId(item, type); // Use helper here too
    if (!item || !contentId || !type) return; // Check contentId

    try {
      const sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        setIsInFavorites(false);
        setIsInWatchlist(false);
        setIsInReadingList(false);
        return;
      }

      const favRes = await fetch(
        `/api/favorites/check?contentId=${contentId}&contentType=${type}`, // Use contentId in URL
        {
          headers: {
            Authorization: `Bearer ${sessionId}`,
          },
        }
      );
      const favData = await favRes.json();
      setIsInFavorites(favData.inFavorites);
    } catch (error) {
      console.error("Failed to check favorites:", error);
      setIsInFavorites(false);
    }
  };

  const checkIfInWatchlist = async () => {
    const contentId = getContentId(item, type); // Use helper here too
    if (!item || !contentId || !type) return; // Check contentId

    try {
      const sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        setIsInWatchlist(false);
        return;
      }

      const watchRes = await fetch(
        `/api/watchlist/check?contentId=${contentId}&contentType=${type}`, // Use contentId in URL
        {
          headers: {
            Authorization: `Bearer ${sessionId}`,
          },
        }
      );
      const watchData = await watchRes.json();
      setIsInWatchlist(watchData.inWatchlist);
    } catch (error) {
      console.error("Failed to check watchlist:", error);
      setIsInWatchlist(false);
    }
  };

  const checkIfInReadingList = async () => {
    const contentId = getContentId(item, type); // Use helper here too
    if (!item || !contentId || !type) return; // Check contentId

    try {
      const sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        setIsInReadingList(false);
        return;
      }

      if (type === 'book' || type === 'manga') { // Corrected: Check for both book and manga
        const readRes = await fetch(
          `/api/readlist/check?contentId=${contentId}&contentType=${type}`, // Use contentId in URL
          {
            headers: {
              Authorization: `Bearer ${sessionId}`,
            },
          }
        );
        const readData = await readRes.json();
        setIsInReadingList(readData.inReadingList);
      } else {
        setIsInReadingList(false); // Not a reading type, so not in reading list
      }
    } catch (error) {
      console.error("Failed to check reading list:", error);
      setIsInReadingList(false);
    }
  };

  // Call all check functions
  checkIfInFavorites();
  checkIfInWatchlist();
  checkIfInReadingList();

}, [item, type]); // Dependencies remain item and type/ Dependencies remain item and type
const getContentId = (contentItem, contentType) => {
  if (!contentItem) return null;
  // For TMDB movies/TV and Google Books, the ID is 'id'
  if (contentType === 'movie' || contentType === 'tv' || contentType === 'book') {
    return contentItem.id?.toString();
  }
  // For Jikan Anime/Manga, the ID is 'mal_id'
  if (contentType === 'anime' || contentType === 'manga') {
    return contentItem.mal_id?.toString();
  }
  return null;
};
// Helper to check if content is for reading
const isReadingContentType = (contentType) => {
  return contentType === 'book' || contentType === 'manga';
};

// Helper to check if content is for watching
const isWatchingContentType = (contentType) => {
  return contentType === 'movie' || contentType === 'tv' || contentType === 'anime';
};

  useEffect(() => {
    const loadItemData = async () => {
      try {
        setLoading(true)
        const numericId = Number.parseInt(id)

        if (type === "movie") {
          const [movieDetails, movieCredits, similarMovies] = await Promise.all([
            tmdbApi.getMovieDetails(numericId),
            tmdbApi.getMovieCredits(numericId),
            tmdbApi.getSimilarMovies(numericId),
          ])
          setItem(movieDetails)
          setCredits(movieCredits)
          setSimilarItems(similarMovies.results.slice(0, 8))
        } else if (type === "tv") {
          const [tvDetails, tvCredits, similarTVShows] = await Promise.all([
            tmdbApi.getTVShowDetails(numericId),
            tmdbApi.getTVShowCredits(numericId),
            tmdbApi.getSimilarTVShows(numericId),
          ])
          setItem(tvDetails)
          setCredits(tvCredits)
          setSimilarItems(similarTVShows.results.slice(0, 8))
        } else if (type === "anime") {
          const [animeDetails, animeCharacters, animeRecommendations] = await Promise.all([
            jikanApi.getAnimeById(numericId),
            jikanApi.getAnimeCharacters(numericId).catch(() => ({ data: [] })),
            jikanApi.getAnimeRecommendations(numericId).catch(() => ({ data: [] })),
          ])
          setItem(animeDetails.data)
          setCredits({
            cast: animeCharacters.data.slice(0, 12).map((char) => ({
              id: char.character.mal_id,
              name: char.character.name,
              character: char.role,
              profile_path: char.character.images.jpg.image_url,
              order: 0,
            })),
            crew: [],
          })
          setSimilarItems(
            animeRecommendations.data.slice(0, 8).map((rec) => ({
              id: rec.entry.mal_id,
              title: rec.entry.title,
              poster_path: rec.entry.images.jpg.image_url,
              vote_average: rec.entry.score || 0,
              release_date: rec.entry.aired?.from || "",
            })),
          )
        } else if (type === "manga") {
          const [mangaDetails, mangaCharacters, mangaRecommendations] = await Promise.all([
            jikanApi.getMangaById(numericId),
            jikanApi.getMangaCharacters(numericId).catch(() => ({ data: [] })),
            jikanApi.getMangaRecommendations(numericId).catch(() => ({ data: [] })),
          ])
          setItem(mangaDetails.data)
          setCredits({
            cast: mangaCharacters.data.slice(0, 12).map((char) => ({
              id: char.character.mal_id,
              name: char.character.name,
              character: char.role,
              profile_path: char.character.images.jpg.image_url,
              order: 0,
            })),
            crew: mangaDetails.data.authors.map((author) => ({
              id: author.mal_id,
              name: author.name,
              job: "Author",
              department: "Writing",
              profile_path: null,
            })),
          })
          setSimilarItems(
            mangaRecommendations.data.slice(0, 8).map((rec) => ({
              id: rec.entry.mal_id,
              title: rec.entry.title,
              poster_path: rec.entry.images.jpg.image_url,
              vote_average: rec.entry.score || 0,
              release_date: rec.entry.published?.from || "",
            })),
          )
        } else if (type === "book") {
          const bookDetails = await googleBooksApi.getBookById(id)
          setItem(bookDetails)
          setCredits({
            cast: [],
            crew:
              bookDetails.volumeInfo.authors?.map((author, index) => ({
                id: index,
                name: author,
                job: "Author",
                department: "Writing",
                profile_path: null,
              })) || [],
          })
          // For books, we'll search for similar books by the same author or category
          if (bookDetails.volumeInfo.authors && bookDetails.volumeInfo.authors.length > 0) {
            try {
              const similarBooksResponse = await googleBooksApi.searchBooks(
                `inauthor:"${bookDetails.volumeInfo.authors[0]}"`,
                0,
                8,
              )
              setSimilarItems(
                similarBooksResponse.items
                  ?.filter((book) => book.id !== id)
                  .slice(0, 8)
                  .map((book) => ({
                    id: book.id,
                    title: book.volumeInfo.title,
                    poster_path: getBookImageUrl(book),
                    vote_average: book.volumeInfo.averageRating || 0,
                    release_date: book.volumeInfo.publishedDate || "",
                  })) || [],
              )
            } catch (error) {
              setSimilarItems([])
            }
          }
        }
      } catch (error) {
        console.error("Error loading item data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id && type) {
      loadItemData()
    }
  }, [id, type])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "movie":
        return Film
      case "tv":
        return Tv
      default:
        return Info
    }
  }

  const TypeIcon = getTypeIcon(type)
const handleAddToReadingList = async () => {
  // Get the correct ID based on the item type
  const contentId = getContentId(item, type);
  console.log("Info exists. Details:");
  console.log("Item:", item);
  console.log("Content ID:", contentId); // Log the correct ID
  console.log("Type:", type);
  // Updated check: now uses `contentId` instead of `item.id`
  if (!item || !contentId || !type) {
    console.log("Missing item, content ID, or type. Aborting.");
    return;
  }

  console.log("Info exists. Details:");
  console.log("Item:", item);
  console.log("Content ID:", contentId); // Log the correct ID
  console.log("Type:", type);

  try {
    const sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      throw new Error("No session found. Please log in to add to your reading list.");
    }

    const res = await fetch("/api/readlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionId}`,
      },
      body: JSON.stringify({
        contentId: contentId, // Use the correct, universal contentId here
        contentType: type,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Server error response on add to reading list:", errorData);
      throw new Error(errorData.error || "Failed to add to reading list.");
    }

    const newReadingListItem = await res.json();
    toast({ title: "Added to reading list!" });
    // IMPORTANT: You set setIsInWatchlist(true) here. It should be setIsInReadingList(true)
    setIsInReadingList(true); // Corrected state update for reading list
  } catch (error) {
    console.error("Error adding to reading list:", error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to add to reading list.",
      variant: "destructive",
    });
  }
};
const handleAddToWatchlist = async () => {
  console.log("clicked");

  // Get the correct ID based on the item type
  const contentId = getContentId(item, type);

  // Updated check: now uses `contentId` instead of `item.id`
  if (!item || !contentId || !type) {
    console.log("Missing item, content ID, or type. Aborting.");
    return;
  }

  console.log("Info exists. Details:");
  console.log("Item:", item);
  console.log("Content ID:", contentId); // Log the correct ID
  console.log("Type:", type);

  try {
    const sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      throw new Error("No session found. Please log in.");
    }

    const res = await fetch("/api/watchlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionId}`,
      },
      body: JSON.stringify({
        contentId: contentId, // Use the correct, universal contentId here
        contentType: type,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Server error response on add to watchlist:", errorData);
      throw new Error(errorData.error || "Failed to add to watchlist");
    }

    const newWatchlistItem = await res.json();
    toast({ title: "Added to watchlist!" });
    setIsInWatchlist(true); // Update the local state
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to add to watchlist",
      variant: "destructive",
    });
  }
};

 
 const handleAddToFavorites = async () => {
    const contentId = getContentId(item, type);

    if (!item || !contentId || !type) {
      console.log("Missing item, content ID, or type for favorites. Aborting.");
      return;
    }

    console.log("Attempting to toggle Favorite status...");
    console.log("Item:", item);
    console.log("Content ID:", contentId);
    console.log("Type:", type);
    console.log("Current isInFavorites:", isInFavorites);


    try {
      const sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        throw new Error("No session found. Please log in.");
      }

      let res;
      let method;
      let successMessage;
      let errorMessage;

      if (isInFavorites) {
        // If already in favorites, remove it (DELETE)
        method = "DELETE";
        successMessage = "Removed from favorites!";
        errorMessage = "Failed to remove from favorites.";
        res = await fetch("/api/favorites", {
          method: method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionId}`,
          },
          body: JSON.stringify({
            contentId: contentId, // DELETE often takes ID in body or URL param
            contentType: type, // Pass contentType for accurate deletion if needed on backend
          }),
        });
      } else {
        // If not in favorites, add it (POST)
        method = "POST";
        successMessage = "Added to favorites!";
        errorMessage = "Failed to add to favorites.";
        res = await fetch("/api/favorites", {
          method: method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionId}`,
          },
          body: JSON.stringify({
            contentId: contentId,
            contentType: type,
            // Assuming FavoriteItem model does not require 'title' based on previous conversation
            // If it does, you'd add: title: getContentTitle(item, type),
          }),
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        console.error(`Server error response on ${method} favorites:`, errorData);
        throw new Error(errorData.error || errorMessage);
      }

      // Update local state based on the action
      setIsInFavorites(!isInFavorites);
      toast({ title: successMessage });

    } catch (error) {
      console.error("Error toggling favorites:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to toggle favorites",
        variant: "destructive",
      });
    }
  };
  const handleSubmitComment = () => {
    if (userComment.trim() && userRating > 0) {
      console.log("Submit comment:", { rating: userRating, comment: userComment })
      setUserComment("")
      setUserRating(0)
    }
  }

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Helper function to get rating safely
  const getRating = (item: any) => {
    if (!item) return 0
    if ("vote_average" in item) return item.vote_average || 0
    if ("score" in item) return item.score || 0
    if ("volumeInfo" in item && item.volumeInfo.averageRating) return item.volumeInfo.averageRating
    return 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Sidebar />

        <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
       
<Button variant="ghost" size="icon" className="text-white" onClick={() => router.back()}>
  <ArrowLeft className="h-5 w-5" />
</Button>
              <Skeleton className="h-6 w-48 bg-white/20" />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Skeleton className="w-full h-96 bg-white/20 rounded-lg" />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-12 w-3/4 bg-white/20" />
              <Skeleton className="h-6 w-1/2 bg-white/20" />
              <Skeleton className="h-24 w-full bg-white/20" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Item Not Found</h1>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  const isMovie = "title" in item && "runtime" in item
  const isTV = "name" in item && "number_of_episodes" in item
  const isAnime = "mal_id" in item && "episodes" in item
  const isManga = "mal_id" in item && "chapters" in item
  const isBook = "volumeInfo" in item

  let title = ""
  let originalTitle = ""
  let releaseDate = ""
  let imageUrl = ""
  let backdropUrl = ""

  if (isMovie) {
    title = item.title
    originalTitle = item.original_title
    releaseDate = item.release_date
    imageUrl = getImageUrl(item.poster_path)
    backdropUrl = getImageUrl(item.backdrop_path, "w1280")
  } else if (isTV) {
    title = item.name
    originalTitle = item.original_name
    releaseDate = item.first_air_date
    imageUrl = getImageUrl(item.poster_path)
    backdropUrl = getImageUrl(item.backdrop_path, "w1280")
  } else if (isAnime) {
    title = item.title_english || item.title
    originalTitle = item.title_japanese || item.title
    releaseDate = item.aired?.from || ""
    imageUrl = item.images.jpg.large_image_url || item.images.jpg.image_url
    backdropUrl = imageUrl
  } else if (isManga) {
    title = item.title_english || item.title
    originalTitle = item.title_japanese || item.title
    releaseDate = item.published?.from || ""
    imageUrl = item.images.jpg.large_image_url || item.images.jpg.image_url
    backdropUrl = imageUrl
  } else if (isBook) {
    title = item.volumeInfo.title
    originalTitle = item.volumeInfo.subtitle || ""
    releaseDate = item.volumeInfo.publishedDate || ""
    imageUrl = getBookImageUrl(item, "large")
    backdropUrl = imageUrl
  }

  const rating = getRating(item)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
        
<Button variant="ghost" size="icon" className="text-white" onClick={() => router.back()}>
  <ArrowLeft className="h-5 w-5" />
</Button>
            <div className="flex items-center gap-2">
              <TypeIcon className="h-6 w-6 text-white" />
              <h1 className="text-xl font-bold text-white">{title}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Backdrop */}
      <section className="relative">
        <div className="absolute inset-0">
          <Image src={backdropUrl || "/placeholder.svg"} alt={title} fill className="object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        </div>

        <div className="relative container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Poster */}
            <div className="lg:col-span-1">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 overflow-hidden">
                <Image
                  src={imageUrl || "/placeholder.svg"}
                  alt={title}
                  width={400}
                  height={600}
                  className="w-full h-auto object-cover"
                />
              </Card>
            </div>

            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
                {originalTitle !== title && <p className="text-gray-300 text-lg mb-4">{originalTitle}</p>}

                <div className="flex flex-wrap items-center gap-4 mb-6">
                  {rating > 0 && (
                    <Badge className="bg-yellow-500 text-black text-lg px-3 py-1">
                      <Star className="h-4 w-4 mr-1" />
                      {rating.toFixed(1)}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-white border-white/30">
                    {releaseDate ? new Date(releaseDate).getFullYear() : "TBA"}
                  </Badge>
                  {isMovie && "runtime" in item && item.runtime && (
                    <Badge variant="outline" className="text-white border-white/30">
                      {formatRuntime(item.runtime)}
                    </Badge>
                  )}
                  {!isMovie && "number_of_episodes" in item && (
                    <Badge variant="outline" className="text-white border-white/30">
                      {item.number_of_episodes} Episodes
                    </Badge>
                  )}
                  {!isMovie && "number_of_seasons" in item && (
                    <Badge variant="outline" className="text-white border-white/30">
                      {item.number_of_seasons} Seasons
                    </Badge>
                  )}
                  {isAnime && "episodes" in item && item.episodes && (
                    <Badge variant="outline" className="text-white border-white/30">
                      {item.episodes} Episodes
                    </Badge>
                  )}
                  {isManga && "chapters" in item && item.chapters && (
                    <Badge variant="outline" className="text-white border-white/30">
                      {item.chapters} Chapters
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {item.genres?.map((genre) => (
                    <Badge key={genre.id} variant="secondary" className="bg-purple-600/50 text-white">
                      {genre.name}
                    </Badge>
                  ))}
                  {isBook &&
                    item.volumeInfo.categories?.map((category, index) => (
                      <Badge key={index} variant="secondary" className="bg-purple-600/50 text-white">
                        {category}
                      </Badge>
                    ))}
                </div>

                {item.tagline && <p className="text-gray-300 text-lg italic mb-4">"{item.tagline}"</p>}

                <p className="text-gray-300 text-lg leading-relaxed mb-6">{item.overview || item.synopsis}</p>
                {isBook && <p className="text-gray-300 text-lg leading-relaxed mb-6">{getBookDescription(item)}</p>}

{/* Action Buttons */}
<div className="flex flex-wrap gap-4">

  {/* Favorites Button (general favorite, applies to any content type) */}
  <Button
    size="lg"
    variant="outline"
    className={`${isInFavorites ? "bg-pink-600 text-white" : "bg-transparent text-white border-white/30"}`}
    onClick={handleAddToFavorites}
  >
    <Heart className={`h-5 w-5 mr-2 ${isInFavorites ? "fill-current" : ""}`} />
    {isInFavorites ? "In Favorites" : "Add to Favorites"}
  </Button>

  {/* Watchlist Button (conditionally rendered for movies, TV series, anime) */}
  {isWatchingContentType(type) && (
    <Button
      size="lg"
      variant="outline"
      className={`${isInWatchlist ? "bg-blue-600 text-white" : "bg-transparent text-white border-white/30"}`}
      onClick={handleAddToWatchlist}
    >
      <Eye className="h-5 w-5 mr-2" /> {/* Clear icon for watching */}
      {isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
    </Button>
  )}

  {/* Reading List Button (conditionally rendered for books and manga) */}
  {isReadingContentType(type) && (
    <Button
      size="lg"
      variant="outline"
      className={`${isInReadingList ? "bg-orange-600 text-white" : "bg-transparent text-white border-white/30"}`}
      onClick={handleAddToReadingList}
    >
      <BookOpen className="h-5 w-5 mr-2" /> {/* Clear icon for reading */}
      {isInReadingList ? "In Reading List" : "Add to Reading List"}
    </Button>
  )}

  {/* Share Button (always present) */}
  <Button size="lg" variant="outline" className="bg-transparent text-white border-white/30">
    <Share2 className="h-5 w-5 mr-2" />
    Share
  </Button>
</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Information Tabs */}
      <section className="container mx-auto px-4 py-12">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-md">
            <TabsTrigger value="details" className="data-[state=active]:bg-white/20">
              Details
            </TabsTrigger>
            <TabsTrigger value="cast" className="data-[state=active]:bg-white/20">
              Cast & Crew
            </TabsTrigger>
            <TabsTrigger value="comments" className="data-[state=active]:bg-white/20">
              Comments ({friendsComments.length})
            </TabsTrigger>
            <TabsTrigger value="related" className="data-[state=active]:bg-white/20">
              Similar
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="mt-8">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Detailed Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-300 mb-1">Status</h4>
                    <p>{item.status}</p>
                  </div>
                  {item.original_language && (
                    <div>
                      <h4 className="font-semibold text-gray-300 mb-1">Original Language</h4>
                      <p>{item.original_language.toUpperCase()}</p>
                    </div>
                  )}
                  {releaseDate && (
                    <div>
                      <h4 className="font-semibold text-gray-300 mb-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {isMovie ? "Release Date" : isBook ? "Published Date" : "First Air Date"}
                      </h4>
                      <p>{new Date(releaseDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {!isMovie && "last_air_date" in item && item.last_air_date && (
                    <div>
                      <h4 className="font-semibold text-gray-300 mb-1">Last Air Date</h4>
                      <p>{new Date(item.last_air_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  {isAnime && "aired" in item && item.aired?.string && (
                    <div>
                      <h4 className="font-semibold text-gray-300 mb-1">Aired</h4>
                      <p>{item.aired.string}</p>
                    </div>
                  )}
                  {isManga && "published" in item && item.published?.string && (
                    <div>
                      <h4 className="font-semibold text-gray-300 mb-1">Published</h4>
                      <p>{item.published.string}</p>
                    </div>
                  )}
                  {isBook && "volumeInfo" in item && item.volumeInfo.publishedDate && (
                    <div>
                      <h4 className="font-semibold text-gray-300 mb-1">Published Date</h4>
                      <p>{item.volumeInfo.publishedDate}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {isMovie && "budget" in item && item.budget > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-300 mb-1 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Budget
                      </h4>
                      <p>{formatCurrency(item.budget)}</p>
                    </div>
                  )}
                  {isMovie && "revenue" in item && item.revenue > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-300 mb-1">Revenue</h4>
                      <p>{formatCurrency(item.revenue)}</p>
                    </div>
                  )}
                  {!isMovie && "networks" in item && item.networks.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-300 mb-1">Networks</h4>
                      <p>{item.networks.map((n) => n.name).join(", ")}</p>
                    </div>
                  )}
                  {item.production_companies && item.production_companies.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-300 mb-1">Production Companies</h4>
                      <p>{item.production_companies.map((c) => c.name).join(", ")}</p>
                    </div>
                  )}
                  {isBook && "volumeInfo" in item && item.volumeInfo.pageCount && (
                    <div>
                      <h4 className="font-semibold text-gray-300 mb-1">Page Count</h4>
                      <p>{item.volumeInfo.pageCount}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cast & Crew Tab */}
          <TabsContent value="cast" className="mt-8">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Cast & Crew</CardTitle>
              </CardHeader>
              <CardContent>
                {credits && (
                  <div className="space-y-8">
                    {/* Cast */}
                    {credits.cast.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-4">Cast</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {credits.cast.slice(0, 12).map((person) => (
                            <div key={person.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                              <Avatar>
                                <AvatarImage src={person.profile_path || "/placeholder.svg"} alt={person.name} />
                                <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <p className="text-white font-medium truncate">{person.name}</p>
                                <p className="text-gray-400 text-sm truncate">{person.character}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Key Crew */}
                    {credits.crew.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-4">Key Crew</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {credits.crew
                            .filter((person) =>
                              ["Director", "Producer", "Writer", "Screenplay", "Author"].includes(person.job),
                            )
                            .slice(0, 9)
                            .map((person) => (
                              <div
                                key={`${person.id}-${person.job}`}
                                className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                              >
                                <Avatar>
                                  <AvatarImage src={person.profile_path || "/placeholder.svg"} alt={person.name} />
                                  <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <p className="text-white font-medium truncate">{person.name}</p>
                                  <p className="text-gray-400 text-sm truncate">{person.job}</p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="mt-8">
            <div className="space-y-6">
              {/* Add Comment */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Add Your Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-white mb-2 block">Your Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                        <button
                          key={star}
                          onClick={() => setUserRating(star)}
                          className={`p-1 ${star <= userRating ? "text-yellow-500" : "text-gray-400"}`}
                        >
                          <Star className="h-5 w-5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    placeholder="Write your review..."
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    rows={4}
                  />
                  <Button onClick={handleSubmitComment} disabled={!userComment.trim() || userRating === 0}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Submit Review
                  </Button>
                </CardContent>
              </Card>

              {/* Friends Comments */}
              <div className="space-y-4">
                {friendsComments.map((comment) => (
                  <Card key={comment.id} className="bg-white/10 backdrop-blur-md border-white/20">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={comment.avatar || "/placeholder.svg"} alt={comment.user} />
                          <AvatarFallback>{comment.user.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-white font-semibold">{comment.user}</h4>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-yellow-500 text-sm">{comment.rating}/10</span>
                            </div>
                            <span className="text-gray-400 text-sm">{new Date(comment.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-gray-300 mb-3">{comment.comment}</p>
                          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {comment.likes}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Similar Items Tab */}
          <TabsContent value="related" className="mt-8">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">You Might Also Like</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {similarItems.map((similarItem) => {
                    const itemTitle = "title" in similarItem ? similarItem.title : similarItem.name
                    const itemDate =
                      "release_date" in similarItem ? similarItem.release_date : similarItem.first_air_date
                    const itemType = "title" in similarItem ? "movie" : "tv"

                    return (
                      <Link key={similarItem.id} href={`/item/${itemType}-${similarItem.id}`}>
                        <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 group cursor-pointer">
                          <CardContent className="p-0">
                            <div className="relative overflow-hidden rounded-t-lg">
                              <Image
                                src={similarItem.poster_path || "/placeholder.svg"}
                                alt={itemTitle}
                                width={200}
                                height={300}
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {similarItem.vote_average > 0 && (
                                <div className="absolute top-2 right-2">
                                  <Badge className="bg-yellow-500 text-black text-xs">
                                    <Star className="h-3 w-3 mr-1" />
                                    {similarItem.vote_average.toFixed(1)}
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <h4 className="font-semibold text-white text-sm mb-1 line-clamp-2">{itemTitle}</h4>
                              <p className="text-gray-400 text-xs">
                                {itemDate ? new Date(itemDate).getFullYear() : "TBA"}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}
