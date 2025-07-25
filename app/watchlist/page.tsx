// /app/watchlist/page.tsx
"use client";
import Loading from './loading';
import Link from "next/link"
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ListPlus,
  Star,
  Calendar,
  Trash2,
  Filter,
  Eye, // For 'watching'
  CheckCircle, // For 'completed'
  PauseCircle, // For 'on-hold'
  XCircle, // For 'dropped'
  Clock,Search, // For 'plan-to-watch'
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { toast } from "@/components/ui/use-toast";
import NotLoggedInComponent from "@/components/NotLoggedInComponent"; // Import the new component
import UserDropdown from "@/components/NotLoggedInComponent"; // Import the new component

// API Imports
import { tmdbApi, getImageUrl } from "@/lib/tmdb-api";
import { jikanApi } from "@/lib/jikan-api";

// Assuming your WatchlistItem model interface is also defined here or imported
// For simplicity, let's define the RawWatchlistItem here, matching the DB structure
interface RawWatchlistItem {
  _id: string; // MongoDB ObjectId as a string
  userId: string;
  contentId: string;
  contentType: "movie" | "tv" | "anime";
  status: "plan-to-watch" | "watching" | "completed" | "on-hold" | "dropped";
  progress?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
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
  genres: string[];
  status: "plan-to-watch" | "watching" | "completed" | "on-hold" | "dropped";
  progress?: string;
}

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<DisplayWatchlistItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false); 
  useEffect(() => {
    async function fetchWatchlistAndDetails() {
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
                      genres: movieData.genres ? movieData.genres.map((g) => g.name) : [],
                      status: item.status,
                      progress: item.progress,
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
                      genres: tvData.genres ? tvData.genres.map((g) => g.name) : [],
                      status: item.status,
                      progress: item.progress,
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
                      genres: animeData.genres ? animeData.genres.map((g) => g.name) : [],
                      status: item.status,
                      progress: item.progress,
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
    }

    fetchWatchlistAndDetails();
  }, []);

  // Function to remove a watchlist item from both frontend state and backend
  const removeWatchlistItem = async (watchlistRecordId: string) => {
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
          _id: watchlistRecordId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error response on remove watchlist item:", errorData);
        throw new Error(errorData.error || "Failed to remove item from watchlist");
      }

      setWatchlist((prev) => prev.filter((item) => item._id !== watchlistRecordId));
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

  // Function to update the status of a watchlist item
  const updateWatchlistItemStatus = async (
    watchlistRecordId: string,
    newStatus: DisplayWatchlistItem["status"]
  ) => {
    try {
      const sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        toast({
          title: "Error",
          description: "No session found. Cannot update item status. Please log in.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/watchlist", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify({
          _id: watchlistRecordId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error response on update watchlist status:", errorData);
        throw new Error(errorData.error || "Failed to update item status");
      }

      // Update local state
      setWatchlist((prev) =>
        prev.map((item) =>
          item._id === watchlistRecordId ? { ...item, status: newStatus } : item
        )
      );
      toast({ title: "Watchlist status updated!" });
    } catch (err: any) {
      console.error("Error updating watchlist status:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to update item status.",
        variant: "destructive",
      });
    }
  };

  // Placeholder for adding to watchlist (you'd typically trigger this from search results/detail pages)
  const handleAddToWatchlist = async (
    contentId: string,
    contentType: "movie" | "tv" | "anime"
  ) => {
    try {
      const sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        toast({
          title: "Error",
          description: "No session found. Please log in to add to watchlist.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify({ contentId, contentType, status: "plan-to-watch" }), // Default status when adding
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error adding to watchlist:", errorData);
        // Handle 409 Conflict specifically if the item is already there
        if (response.status === 409) {
          toast({
            title: "Already in Watchlist",
            description: "This item is already in your watchlist.",
            variant: "default",
          });
        } else {
          throw new Error(errorData.error || "Failed to add to watchlist");
        }
      } else {
        const newItem = await response.json();
        // Add the newly added item to the local state, assuming it's returned by the API
        // You might need to refetch details for it if the API doesn't return full DisplayWatchlistItem
        setWatchlist((prev) => [
          {
            _id: newItem._id,
            id: newItem.contentId,
            title: "Fetching...", // Placeholder until details are fetched
            type: newItem.contentType,
            poster: "/placeholder.svg",
            rating: 0,
            year: 0,
            addedDate: newItem.createdAt,
            genres: [],
            status: newItem.status,
            progress: newItem.progress,
          },
          ...prev,
        ]);
        toast({ title: "Added to watchlist!" });
        // Optionally, trigger a re-fetch of all watchlist items to get full details
        // This might be better for consistency but causes a full reload.
        // fetchWatchlistAndDetails();
      }
    } catch (err: any) {
      console.error("Error adding to watchlist:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to add to watchlist.",
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

  const getStatusColor = (status: DisplayWatchlistItem["status"]) => {
    switch (status) {
      case "plan-to-watch":
        return "bg-gray-500";
      case "watching":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "on-hold":
        return "bg-orange-500";
      case "dropped":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: DisplayWatchlistItem["status"]) => {
    switch (status) {
      case "plan-to-watch":
        return "Plan to Watch";
      case "watching":
        return "Watching";
      case "completed":
        return "Completed";
      case "on-hold":
        return "On Hold";
      case "dropped":
        return "Dropped";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: DisplayWatchlistItem["status"]) => {
    switch (status) {
      case "plan-to-watch":
        return <Clock className="h-3 w-3 mr-1" />;
      case "watching":
        return <Eye className="h-3 w-3 mr-1" />;
      case "completed":
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case "on-hold":
        return <PauseCircle className="h-3 w-3 mr-1" />;
      case "dropped":
        return <XCircle className="h-3 w-3 mr-1" />;
      default:
        return null;
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

      {/* Main App Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 ml-12">
              <h1 className="text-2xl font-bold text-white">AniMov</h1>
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
                <ListPlus className="h-8 w-8 text-indigo-500" />
                <div>
                  <h1 className="text-3xl font-bold text-white">Watchlist</h1>
                  <p className="text-gray-400">Content you plan to watch or are currently watching</p>
                </div>
              </div>
              <Badge variant="outline" className="text-white border-white/20">
                {filteredWatchlist.length} items
              </Badge>
            </div>
{/* Filter Controls */}
<div className="flex flex-wrap items-center gap-4">

  <Filter className="h-5 w-5 text-gray-400" />

  {/* Mobile Dropdowns */}
  <div className="block md:hidden flex flex-col gap-2 w-full">

    {/* Type Dropdown */}
    <select
      value={selectedType}
      onChange={(e) => setSelectedType(e.target.value)}
      className="bg-white/10 border border-white/20 text-white p-2 rounded"
    >
      {["all", "movie", "tv", "anime"].map((type) => (
        <option key={type} value={type}>
          {type === "all" ? "All Types" : getTypeLabel(type)}
        </option>
      ))}
    </select>

    {/* Status Dropdown */}
    <select
      value={selectedStatus}
      onChange={(e) =>
        setSelectedStatus(e.target.value as DisplayWatchlistItem["status"] | "all")
      }
      className="bg-white/10 border border-white/20 text-white p-2 rounded"
    >
      {["all", "plan-to-watch", "watching", "completed", "on-hold", "dropped"].map((status) => (
        <option key={status} value={status}>
          {status === "all" ? "All Statuses" : getStatusLabel(status as DisplayWatchlistItem["status"])}
        </option>
      ))}
    </select>
  </div>

  {/* Desktop Buttons */}
  <div className="hidden md:flex gap-2 flex-wrap">
    {["all", "movie", "tv", "anime"].map((type) => (
      <Button
        key={type}
        variant={selectedType === type ? "default" : "outline"}
        size="sm"
        onClick={() => setSelectedType(type)}
        className={
          selectedType === type
            ? "bg-indigo-600 hover:bg-indigo-700"
            : "bg-white/10 border-white/20 text-white hover:bg-white/20"
        }
      >
        {type === "all" ? "All Types" : getTypeLabel(type)}
      </Button>
    ))}
  </div>

  <div className="hidden md:flex gap-2 flex-wrap ml-auto">
    {["all", "plan-to-watch", "watching", "completed", "on-hold", "dropped"].map((status) => (
      <Button
        key={status}
        variant={selectedStatus === status ? "default" : "outline"}
        size="sm"
        onClick={() =>
          setSelectedStatus(status as DisplayWatchlistItem["status"] | "all")
        }
        className={
          selectedStatus === status
            ? "bg-indigo-600 hover:bg-indigo-700"
            : "bg-white/10 border-white/20 text-white hover:bg-white/20"
        }
      >
        {status === "all" ? "All Statuses" : getStatusLabel(status as DisplayWatchlistItem["status"])}
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
              <ListPlus className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Your watchlist is empty</h3>
              <p className="text-gray-400">Start adding movies, TV series, or anime to your watchlist</p>
              {/* Example of how you might use handleAddToWatchlist from here for testing */}
              {/* <Button onClick={() => handleAddToWatchlist("100", "movie")}>Add Sample Movie</Button> */}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredWatchlist.map((item) => (
                     <Link key={item.id} href={`/item/${item.type}-${item.id}`}>
                <Card
                  key={item._id}
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
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <Badge className={`${getTypeColor(item.type)} text-white`}>
                          {getTypeLabel(item.type)}
                        </Badge>
                        <Badge className={`${getStatusColor(item.status)} text-white`}>
                          {getStatusIcon(item.status)} {getStatusLabel(item.status)}
                        </Badge>
                      </div>
                      <div className="absolute bottom-2 right-2">
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
                      {item.progress && (
                        <div className="text-sm text-gray-300 mb-2">
                          Progress: {item.progress}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {item.genres.slice(0, 2).map((genre, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-3 flex gap-2 justify-center">
                         {/* Status Update Buttons */}
                        {item.status !== 'watching' && (
                            <Button size="sm" onClick={() => updateWatchlistItemStatus(item._id, "watching")}>
                                Watching
                            </Button>
                        )}
                        {item.status !== 'completed' && (
                            <Button size="sm" onClick={() => updateWatchlistItemStatus(item._id, "completed")}>
                                Completed
                            </Button>
                        )}
                        {/* Add more status buttons as needed */}
                      </div>
                    </div>
                  </CardContent>
                </Card></Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}