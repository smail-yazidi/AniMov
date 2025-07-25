// @/app/favorites/page.tsx
"use client"; // This must be at the very top of the file
import Loading from './loading';
import Link from "next/link"
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Filter, Search } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { toast } from "@/components/ui/use-toast"; // Assuming shadcn/ui toast
import NotLoggedInComponent from "@/components/NotLoggedInComponent"; // Import the new component
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

// API Imports - Adjust paths if different in your project
// Corrected import to use getMovieDetails and getTVShowDetails
import { tmdbApi, getImageUrl } from "@/lib/tmdb-api"; // Assuming your tmdb-api.ts is in lib
import { jikanApi } from "@/lib/jikan-api"; // Assuming your jikan-api.ts is in lib
import { googleBooksApi, getBookImageUrl } from "@/lib/google-books-api"; // Assuming your google-books-api.ts is in lib

// Interface for the raw favorite item as stored in your database
interface RawFavoriteItem {
  _id: string; // MongoDB ObjectId as a string
  userId: string; // userId as a string
  contentId: string;
  contentType: "movie" | "tv" | "anime" | "manga" | "book";
  createdAt: string; // ISO date string
}

// Interface for the favorite item with detailed information, used for display
interface DisplayFavoriteItem {
  _id: string; // The ID of the favorite record itself from MongoDB
  id: string; // The content ID (e.g., TMDB movie ID, Jikan anime ID)
  title: string;
  type: "movie" | "tv" | "anime" | "manga" | "book";
  poster: string;
  rating: number;
  year: number;
  addedDate: string; // Date when the item was added to favorites
  genres: string[];
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<DisplayFavoriteItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false); 

const categories = [
  { id: "movies", name: "Movies", icon: Film, color: "bg-red-500", urlType: "movies" },
  { id: "series", name: "TV Series", icon: Tv, color: "bg-blue-500", urlType: "series" },
  { id: "anime", name: "Anime", icon: Play, color: "bg-purple-500", urlType: "anime" },
  { id: "manga", name: "Manga", icon: BookOpen, color: "bg-orange-500", urlType: "anime" },
  { id: "books", name: "Books", icon: Book, color: "bg-green-500", urlType: "books" },
]
  useEffect(() => {
    async function fetchFavoritesAndDetails() {
      try {
        setLoading(true);
        setError(null);

              const sessionId = localStorage.getItem("sessionId");
        if (!sessionId) {
          setIsUserLoggedIn(false); 
              setLoading(false);
           return; 
        } else {
          setIsUserLoggedIn(true); // <<< You set this state to true if logged in
        }


        // 1. Fetch raw favorite items (contentId, contentType, _id) from your backend
        const response = await fetch("/api/favorites", {
          headers: {
            Authorization: `Bearer ${sessionId}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error fetching raw favorites:", errorData);
          throw new Error(
            errorData.error || `Failed to fetch favorite IDs: ${response.statusText}`
          );
        }
        const rawFavorites: RawFavoriteItem[] = await response.json();
        console.log("Fetched raw favorites from backend:", rawFavorites);

        // 2. Fetch detailed information for each favorite item from external APIs concurrently
        const detailedFavoritePromises = rawFavorites.map(
          async (fav: RawFavoriteItem) => {
            let itemDetails: DisplayFavoriteItem | null = null;

            try {
              switch (fav.contentType) {
                case "movie":
                  // CORRECTED: Use tmdbApi.getMovieDetails and parse ID to number
                  const movieData = await tmdbApi.getMovieDetails(parseInt(fav.contentId));
                  if (movieData) {
                    itemDetails = {
                      _id: fav._id,
                      id: movieData.id.toString(),
                      title: movieData.title,
                      type: "movie",
                      poster: getImageUrl(movieData.poster_path, "w500"),
                      rating: movieData.vote_average,
                      year: movieData.release_date
                        ? parseInt(movieData.release_date.substring(0, 4))
                        : 0,
                      addedDate: fav.createdAt,
                      genres: movieData.genres ? movieData.genres.map((g) => g.name) : [],
                    };
                  }
                  break;
                case "tv":
                  // CORRECTED: Use tmdbApi.getTVShowDetails and parse ID to number
                  const tvData = await tmdbApi.getTVShowDetails(parseInt(fav.contentId));
                  if (tvData) {
                    itemDetails = {
                      _id: fav._id,
                      id: tvData.id.toString(),
                      title: tvData.name,
                      type: "tv",
                      poster: getImageUrl(tvData.poster_path, "w500"),
                      rating: tvData.vote_average,
                      year: tvData.first_air_date
                        ? parseInt(tvData.first_air_date.substring(0, 4))
                        : 0,
                      addedDate: fav.createdAt,
                      genres: tvData.genres ? tvData.genres.map((g) => g.name) : [],
                    };
                  }
                  break;
                case "anime":
                  const animeDataResponse = await jikanApi.getAnimeById(parseInt(fav.contentId));
                  const animeData = animeDataResponse.data; // Jikan returns data in a 'data' property
                  if (animeData) {
                    itemDetails = {
                      _id: fav._id,
                      id: animeData.mal_id.toString(),
                      title: animeData.title,
                      type: "anime",
                      poster: animeData.images?.webp?.image_url || "/placeholder.svg",
                      rating: animeData.score || 0,
                      year: animeData.aired?.from
                        ? new Date(animeData.aired.from).getFullYear()
                        : 0,
                      addedDate: fav.createdAt,
                      genres: animeData.genres ? animeData.genres.map((g) => g.name) : [],
                    };
                  }
                  break;
                case "manga":
                  const mangaDataResponse = await jikanApi.getMangaById(parseInt(fav.contentId));
                  const mangaData = mangaDataResponse.data; // Jikan returns data in a 'data' property
                  if (mangaData) {
                    itemDetails = {
                      _id: fav._id,
                      id: mangaData.mal_id.toString(),
                      title: mangaData.title,
                      type: "manga",
                      poster: mangaData.images?.webp?.image_url || "/placeholder.svg",
                      rating: mangaData.score || 0,
                      year: mangaData.published?.from
                        ? new Date(mangaData.published.from).getFullYear()
                        : 0,
                      addedDate: fav.createdAt,
                      genres: mangaData.genres ? mangaData.genres.map((g) => g.name) : [],
                    };
                  }
                  break;
                case "book":
                  const bookData = await googleBooksApi.getBookById(fav.contentId);
                  if (bookData) {
                    itemDetails = {
                      _id: fav._id,
                      id: bookData.id.toString(),
                      title: bookData.volumeInfo?.title || "No Title",
                      type: "book",
                      poster:
                        getBookImageUrl(bookData) || "/placeholder.svg", // getBookImageUrl takes the entire book object
                      rating: bookData.volumeInfo?.averageRating || 0, // Google Books has averageRating
                      year: bookData.volumeInfo?.publishedDate
                        ? parseInt(bookData.volumeInfo.publishedDate.substring(0, 4))
                        : 0,
                      addedDate: fav.createdAt,
                      genres: bookData.volumeInfo?.categories || [],
                    };
                  }
                  break;
                default:
                  console.warn(
                    `Unknown content type: ${fav.contentType} for contentId: ${fav.contentId}`
                  );
                  break;
              }
            } catch (detailError) {
              console.error(
                `Failed to fetch details for ${fav.contentType} with ID ${fav.contentId}:`,
                detailError
              );
              // Return null to filter out this item later if its details couldn't be fetched
              return null;
            }

            return itemDetails;
          }
        );

        // Wait for all detail fetches to complete. Use Promise.allSettled to handle individual failures.
        const results = await Promise.allSettled(detailedFavoritePromises);
        const fetchedFavorites: DisplayFavoriteItem[] = results
          .filter(
            (result) => result.status === "fulfilled" && result.value !== null
          )
          .map((result) => (result as PromiseFulfilledResult<DisplayFavoriteItem>).value);

        setFavorites(fetchedFavorites);
        console.log("Processed favorites for display:", fetchedFavorites);
      } catch (err: any) {
        console.error("Error in fetchFavoritesAndDetails:", err);
        setError(err.message || "Failed to load favorites.");
        toast({
          title: "Error",
          description: err.message || "Failed to load favorites. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchFavoritesAndDetails();
  }, []); // Empty dependency array means this runs once on component mount

  // Function to remove a favorite item from both frontend state and backend
  const removeFavorite = async (
    favoriteRecordId: string,
    contentId: string,
    contentType: DisplayFavoriteItem["type"]
  ) => {
    try {
      const sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        toast({
          title: "Error",
          description: "No session found. Cannot remove favorite. Please log in.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/favorites", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify({
          _id: favoriteRecordId, // Send the MongoDB _id for specific deletion
          // contentId and contentType are not strictly needed by the backend DELETE if it uses _id,
          // but can be kept for extra verification or logging if desired.
          // For now, only _id is used in the backend DELETE handler provided previously.
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error response on remove favorite:", errorData);
        throw new Error(errorData.error || "Failed to remove favorite");
      }

      // If successful, update the local state to remove the item instantly
      setFavorites((prev) => prev.filter((item) => item._id !== favoriteRecordId));
      toast({ title: "Removed from favorites!" });
    } catch (err: any) {
      console.error("Error removing favorite:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to remove favorite.",
        variant: "destructive",
      });
    }
  };

  const filteredFavorites = favorites.filter(
    (item) => selectedType === "all" || item.type === selectedType
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case "movie":
        return "bg-blue-600";
      case "tv":
        return "bg-green-600";
      case "anime":
        return "bg-purple-600";
      case "manga":
        return "bg-orange-600";
      case "book":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "movie":
        return "Movie";
      case "tv":
        return "TV Series"; // Display as "TV Series" even if backend uses "tv"
      case "anime":
        return "Anime";
      case "manga":
        return "Manga";
      case "book":
        return "Book";
      default:
        return type;
    }
  };

  if (loading) {
    return (
    <Loading />
    );
  }
    // <<< HERE IS WHERE YOU USE THE isUserLoggedIn STATE TO CONDITIONALY RENDER
  if (!isUserLoggedIn) { // If the check above determined the user is NOT logged in
    return      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative"><Sidebar />  {/* Main App Header */}
        {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 ml-12">
              <h1 className="text-2xl font-bold text-white">AniMov</h1>
            </div>

            <div className="flex items-center gap-4">
            {/*   <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>

              <UserDropdown /> */}
            </div>
          </div>
        </div>
      </header><NotLoggedInComponent /></div> ; // Render the "not logged in" message
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      <Sidebar />

      {/* Main App Header (usually sticky) */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 ml-12">
              <h1 className="text-2xl font-bold text-white">AniMov</h1>
            </div>

        
          </div>
        </div>
      </header>

      {/* Main Content Area for Favorites Page */}
      <div className="relative z-10">
        {/* Favorites Section Header with Filtering */}
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
{/* Filter Buttons */}
<div className="flex flex-wrap items-center gap-4">

  <Filter className="h-5 w-5 text-gray-400" />

  {/* Mobile Dropdown */}
  <div className="block md:hidden w-full">
    <select
      value={selectedType}
      onChange={(e) => setSelectedType(e.target.value)}
      className="w-full bg-white/10 border border-white/20 text-white p-2 rounded"
    >
      {["all", "movie", "tv", "anime", "manga", "book"].map((type) => (
        <option key={type} value={type}>
          {type === "all" ? "All" : getTypeLabel(type)}
        </option>
      ))}
    </select>
  </div>

  {/* Desktop Buttons */}
  <div className="hidden md:flex gap-2 flex-wrap">
    {["all", "movie", "tv", "anime", "manga", "book"].map((type) => (
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

        {/* Favorites Grid */}
        <div className="container mx-auto px-4 py-8">
          {filteredFavorites.length === 0 ? (
         <div className="text-center py-8 md:py-12">
  <Heart className="h-12 w-12 md:h-16 md:w-16 text-gray-500 mx-auto mb-3 md:mb-4" />
  <h3 className="text-lg md:text-xl font-semibold text-white mb-1 md:mb-2">No favorites yet</h3>
  <p className="text-gray-400 mb-6 md:mb-8 text-sm md:text-base">
    Start adding your favorite content to see them here
  </p>
  <br/>
  <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 max-w-xs sm:max-w-md mx-auto">
    {categories.map((category) => (
      <Link 
        key={category.name}
        href={`/${category.urlType}`}
        passHref
      >
        <button
          className={`flex flex-col items-center p-2 sm:p-3 md:p-4 rounded-lg ${category.color} bg-opacity-80 hover:bg-opacity-100 transition-all cursor-pointer w-16 sm:w-20 md:w-24`}
        >
          <category.icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white mb-1 sm:mb-2" />
          <span className="text-white text-xs sm:text-sm font-medium whitespace-nowrap">
            {category.name}
          </span>
        </button>
      </Link>
    ))}
  </div>
</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredFavorites.map((item) => (
                     <Link key={item.id} href={`/item/${item.type}-${item.id}`}>
                <Card
                  key={item._id} // Use the unique MongoDB _id for the key
                  className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 group"
                >
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={item.poster || "/placeholder.svg"} // Fallback to a placeholder
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
                          onClick={() => removeFavorite(item._id, item.id, item.type)} // Pass necessary IDs for removal
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
                        <div className="text-xs">
                          Added {new Date(item.addedDate).toLocaleDateString()}
                        </div>
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
              </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}