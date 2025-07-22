// src/app/watchlist/page.tsx
"use client"; // This must be at the very top of the file

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListVideo, Star, Calendar, Trash2, Filter, Search, Eye } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { toast } from "@/components/ui/use-toast"; // Assuming shadcn/ui toast
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress"; // If you have a progress bar component

// API Imports - Adjust paths if different in your project
import { tmdbApi, getImageUrl } from "@/lib/tmdb-api";
import { jikanApi } from "@/lib/jikan-api";

// Interface for the raw watchlist item as stored in your database
interface RawWatchlistItem {
  _id: string; // MongoDB ObjectId as a string
  userId: string; // userId as a string
  contentId: string;
  contentType: "movie" | "tv" | "anime";
  status: "plan-to-watch" | "watching" | "completed" | "on-hold" | "dropped";
  progress?: string; // Optional progress string
  createdAt: string; // ISO date string
}

// Interface for the watchlist item with detailed information, used for display
interface DisplayWatchlistItem {
  _id: string; // The ID of the watchlist record itself from MongoDB
  id: string; // The content ID (e.g., TMDB movie ID, Jikan anime ID)
  title: string;
  type: "movie" | "tv" | "anime";
  poster: string;
  rating: number;
  year: number;
  addedDate: string; // Date when the item was added to watchlist
  status: "plan-to-watch" | "watching" | "completed" | "on-hold" | "dropped";
  progress?: string;
  genres: string[];
}

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<DisplayWatchlistItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWatchlistAndDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        throw new Error("No session found. Please log in.");
      }

      // 1. Fetch raw watchlist items from your backend
      const response = await fetch("/api/watchlist", {
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching raw watchlist:", errorData);
        throw new Error(
          errorData.error || `Failed to fetch watchlist IDs: ${response.statusText}`
        );
      }
      const rawWatchlist: RawWatchlistItem[] = await response.json();
      console.log("Fetched raw watchlist from backend:", rawWatchlist);

      // 2. Fetch detailed information for each watchlist item from external APIs concurrently
      const detailedWatchlistPromises = rawWatchlist.map(
        async (item: RawWatchlistItem) => {
          let itemDetails: DisplayWatchlistItem | null = null;

          try {
            switch (item.contentType) {
              case "movie":
                const movieData = await tmdbApi.getMovieDetails(parseInt(item.contentId));
                if (movieData) {
                  itemDetails = {
                    _id: item._id,
                    id: movieData.id.toString(),
                    title: movieData.title,
                    type: "movie",
                    poster: getImageUrl(movieData.poster_path, "w500"),
                    rating: movieData.vote_average,
                    year: movieData.release_date
                      ? parseInt(movieData.release_date.substring(0, 4))
                      : 0,
                    addedDate: item.createdAt,
                    status: item.status,
                    progress: item.progress,
                    genres: movieData.genres ? movieData.genres.map((g) => g.name) : [],
                  };
                }
                break;
              case "tv":
                const tvData = await tmdbApi.getTVShowDetails(parseInt(item.contentId));
                if (tvData) {
                  itemDetails = {
                    _id: item._id,
                    id: tvData.id.toString(),
                    title: tvData.name,
                    type: "tv",
                    poster: getImageUrl(tvData.poster_path, "w500"),
                    rating: tvData.vote_average,
                    year: tvData.first_air_date
                      ? parseInt(tvData.first_air_date.substring(0, 4))
                      : 0,
                    addedDate: item.createdAt,
                    status: item.status,
                    progress: item.progress,
                    genres: tvData.genres ? tvData.genres.map((g) => g.name) : [],
                  };
                }
                break;
              case "anime":
                const animeDataResponse = await jikanApi.getAnimeById(parseInt(item.contentId));
                const animeData = animeDataResponse.data;
                if (animeData) {
                  itemDetails = {
                    _id: item._id,
                    id: animeData.mal_id.toString(),
                    title: animeData.title,
                    type: "anime",
                    poster: animeData.images?.webp?.image_url || "/placeholder.svg",
                    rating: animeData.score || 0,
                    year: animeData.aired?.from
                      ? new Date(animeData.aired.from).getFullYear()
                      : 0,
                    addedDate: item.createdAt,
                    status: item.status,
                    progress: item.progress,
                    genres: animeData.genres ? animeData.genres.map((g) => g.name) : [],
                  };
                }
                break;
              default:
                console.warn(
                  `Unknown content type: ${item.contentType} for contentId: ${item.contentId}`
                );
                break;
            }
          } catch (detailError) {
            console.error(
              `Failed to fetch details for ${item.contentType} with ID ${item.contentId}:`,
              detailError
            );
            // Return null to filter out this item later if its details couldn't be fetched
            return null;
          }

          return itemDetails;
        }
      );

      const results = await Promise.allSettled(detailedWatchlistPromises);
      const fetchedWatchlist: DisplayWatchlistItem[] = results
        .filter(
          (result) => result.status === "fulfilled" && result.value !== null
        )
        .map((result) => (result as PromiseFulfilledResult<DisplayWatchlistItem>).value);

      setWatchlist(fetchedWatchlist);
      console.log("Processed watchlist for display:", fetchedWatchlist);
    } catch (err: any) {
      console.error("Error in fetchWatchlistAndDetails:", err);
      setError(err.message || "Failed to load watchlist.");
      toast({
        title: "Error",
        description: err.message || "Failed to load watchlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlistAndDetails();
  }, []); // Empty dependency array means this runs once on component mount

  // Function to remove a watchlist item from both frontend state and backend
  const removeWatchlistItem = async (watchlistItemId: string) => {
    try {
      const sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        toast({
          title: "Error",
          description: "No session found. Cannot remove item. Please log in.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/watchlist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify({
          _id: watchlistItemId, // Send the MongoDB _id for specific deletion
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error response on remove watchlist item:", errorData);
        throw new Error(errorData.error || "Failed to remove item from watchlist");
      }

      // If successful, update the local state to remove the item instantly
      setWatchlist((prev) => prev.filter((item) => item._id !== watchlistItemId));
      toast({ title: "Removed from watchlist!" });
    } catch (err: any) {
      console.error("Error removing watchlist item:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to remove item from watchlist.",
        variant: "destructive",
      });
    }
  };

  // Function to update the status or progress of a watchlist item
  const updateWatchlistItem = async (
    watchlistItemId: string,
    newStatus?: RawWatchlistItem["status"],
    newProgress?: string
  ) => {
    try {
      const sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        toast({
          title: "Error",
          description: "No session found. Cannot update item. Please log in.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/watchlist", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify({
          _id: watchlistItemId,
          status: newStatus,
          progress: newProgress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error response on update watchlist item:", errorData);
        throw new Error(errorData.error || "Failed to update watchlist item");
      }

      const updatedData = await response.json();
      // Update the local state with the new item data
      setWatchlist((prev) =>
        prev.map((item) => (item._id === watchlistItemId ? { ...item, ...updatedData.item } : item))
      );
      toast({ title: "Watchlist updated!", description: "Item status/progress changed." });
      // Re-fetch details to ensure full consistency if needed, but direct update is usually faster
      // await fetchWatchlistAndDetails();
    } catch (err: any) {
      console.error("Error updating watchlist item:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to update watchlist item.",
        variant: "destructive",
      });
    }
  };




  const filteredWatchlist = watchlist.filter(
    (item) =>
      (selectedType === "all" || item.type === selectedType) &&
      (selectedStatus === "all" || item.status === selectedStatus)
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case "movie":
        return "bg-blue-600";
      case "tv":
        return "bg-green-600";
      case "anime":
        return "bg-purple-600";
      default:
        return "bg-gray-600";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "movie":
        return "Movie";
      case "tv":
        return "TV Series";
      case "anime":
        return "Anime";
      default:
        return type;
    }
  };

  const getStatusColor = (status: RawWatchlistItem["status"]) => {
    switch (status) {
      case "plan-to-watch":
        return "bg-yellow-500 text-yellow-900";
      case "watching":
        return "bg-blue-500 text-blue-900";
      case "completed":
        return "bg-green-500 text-green-900";
      case "on-hold":
        return "bg-orange-500 text-orange-900";
      case "dropped":
        return "bg-red-500 text-red-900";
      default:
        return "bg-gray-500 text-gray-900";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading watchlist...
      </div>
    );
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

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area for Watchlist Page */}
      <div className="relative z-10">
        {/* Watchlist Section Header with Filtering */}
        <header className="bg-black/20 backdrop-blur-md border-b border-white/10 pt-20 pb-6">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <ListVideo className="h-8 w-8 text-blue-500 fill-blue-500" />
                <div>
                  <h1 className="text-3xl font-bold text-white">Watchlist</h1>
                  <p className="text-gray-400">Your planned, ongoing, and completed content</p>
                </div>
              </div>
              <Badge variant="outline" className="text-white border-white/20">
                {filteredWatchlist.length} items
              </Badge>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-4 mb-4">
              <Filter className="h-5 w-5 text-gray-400" />
              <div className="flex gap-2 flex-wrap">
                {["all", "movie", "tv", "anime"].map((type) => (
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
                    {type === "all" ? "All Types" : getTypeLabel(type)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-gray-400" />
              <div className="flex gap-2 flex-wrap">
                {[
                  "all",
                  "plan-to-watch",
                  "watching",
                  "completed",
                  "on-hold",
                  "dropped",
                ].map((status) => (
                  <Button
                    key={status}
                    variant={selectedStatus === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedStatus(status)}
                    className={
                      selectedStatus === status
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                    }
                  >
                    {status === "all"
                      ? "All Statuses"
                      : status
                          .split("-")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ")}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Watchlist Grid */}
        <div className="container mx-auto px-4 py-8">
          {filteredWatchlist.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No items in watchlist yet</h3>
              <p className="text-gray-400">Start adding content to your watchlist</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredWatchlist.map((item) => (
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

                      {/* Dropdown for Status and Remove Button */}
                      <div className="absolute bottom-2 right-2 flex gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="bg-gray-700 hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Status: {item.status.charAt(0).toUpperCase() + item.status.slice(1).replace(/-/g, ' ')}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-48 bg-gray-800 border-gray-700 text-white">
                            {["plan-to-watch", "watching", "completed", "on-hold", "dropped"].map(
                              (statusOption) => (
                                <DropdownMenuItem
                                  key={statusOption}
                                  onClick={() => updateWatchlistItem(item._id, statusOption as RawWatchlistItem["status"])}
                                  className="hover:bg-gray-700 cursor-pointer"
                                >
                                  {statusOption
                                    .split("-")
                                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(" ")}
                                </DropdownMenuItem>
                              )
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeWatchlistItem(item._id)}
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
                      {item.progress && item.status !== "completed" && (
                        <div className="text-sm text-gray-300 mt-1 mb-2">Progress: {item.progress}</div>
                      )}
                      {/* You can add a simple progress bar here if 'progress' can be parsed to a number/percentage */}
                      {/* Example if progress is like "50%" or "5/10" */}
                      {/* {item.progress && item.progress.includes('/') && (
                        <Progress value={(parseInt(item.progress.split('/')[0]) / parseInt(item.progress.split('/')[1])) * 100} className="w-full mt-2" />
                      )} */}
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
  );
}