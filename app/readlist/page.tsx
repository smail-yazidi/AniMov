// /app/readlist/page.tsx
"use client";
import Loading from './loading';
import Link from "next/link"
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NotLoggedInComponent from "@/components/NotLoggedInComponent"; // Import the new component
import UserDropdown from "@/components/NotLoggedInComponent"; // Import the new component


import {
  BookOpen,
  Book,
  PenTool, // For manga icon (or custom icon)
  Star,
  Calendar,
  Trash2,
  Filter,
  Eye, // For 'reading'
  CheckCircle, // For 'completed'
  PauseCircle, // For 'on-hold'
  XCircle, // For 'dropped'
  Clock, // For 'plan-to-read'
  Search,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { toast } from "@/components/ui/use-toast";
// Correctly import your Google Books API utility
import { googleBooksApi, getBookImageUrl } from "@/lib/google-books-api";
// API Imports (assuming jikanApi is correctly set up)
import { jikanApi } from "@/lib/jikan-api";


// Interface for the raw readlist item from your backend (matches Mongoose model)
interface RawReadlistItem {
  _id: string; // MongoDB ObjectId as a string
  userId: string;
  contentId: string; // The ID from Jikan, Google Books, etc.
  contentType: "manga" | "book";
  title: string;
  poster?: string;
  status: "plan-to-read" | "reading" | "completed" | "on-hold" | "dropped";
  rating?: number;
  progress?: {
    current: number;
    total?: number;
    unit: "chapter" | "volume" | "page";
  };
  notes?: string;
  startDate?: string; // ISO date string
  completedDate?: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Interface for the readlist item with detailed information, used for display
interface DisplayReadlistItem {
  _id: string; // The ID of the readlist record itself from MongoDB
  id: string; // The content ID (e.g., Jikan manga ID, Google Books volume ID)
  title: string;
  type: "manga" | "book";
  poster: string;
  rating?: number;
  year?: number; // Publication year
  addedDate: string; // Date when the item was added to readlist
  genres?: string[]; // Manga genres or book categories
  status: "plan-to-read" | "reading" | "completed" | "on-hold" | "dropped";
  progress?: {
    current: number;
    total?: number;
    unit: "chapter" | "volume" | "page";
  };
  notes?: string;
  startDate?: string;
  completedDate?: string;
}

export default function ReadlistPage() {
  const [readlist, setReadlist] = useState<DisplayReadlistItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false); 
  const categories = [
 
  { id: "manga", name: "Manga", icon: BookOpen, color: "bg-orange-500", urlType: "manga" },
  { id: "books", name: "Books", icon: Book, color: "bg-green-500", urlType: "books" },
]
  useEffect(() => {
    async function fetchReadlistAndDetails() {
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

        // 1. Fetch raw readlist items from your backend
        const response = await fetch("/api/readlist", {
          headers: {
            Authorization: `Bearer ${sessionId}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error fetching raw readlist:", errorData);
          throw new Error(
            errorData.error || `Failed to fetch readlist IDs: ${response.statusText}`
          );
        }
        const rawReadlist: RawReadlistItem[] = await response.json();
        console.log("Fetched raw readlist from backend:", rawReadlist);

        // 2. Fetch detailed information for each readlist item from external APIs concurrently
        const detailedReadlistPromises = rawReadlist.map(
          async (item: RawReadlistItem) => {
            let itemDetails: DisplayReadlistItem | null = null;

            try {
              switch (item.contentType) {
                case "manga":
                  const mangaDataResponse = await jikanApi.getMangaById(
                    parseInt(item.contentId)
                  );
                  const mangaData = mangaDataResponse.data;
                  if (mangaData) {
                    itemDetails = {
                      _id: item._id,
                      id: mangaData.mal_id.toString(),
                      title: mangaData.title,
                      type: "manga",
                      poster: mangaData.images?.webp?.image_url || "/placeholder.svg",
                      rating: mangaData.score || 0,
                      year: mangaData.published?.from
                        ? new Date(mangaData.published.from).getFullYear()
                        : 0,
                      addedDate: item.createdAt,
                      genres: mangaData.genres ? mangaData.genres.map((g) => g.name) : [],
                      status: item.status,
                      progress: item.progress,
                      notes: item.notes,
                      startDate: item.startDate,
                      completedDate: item.completedDate,
                    };
                  }
                  break;
                case "book":
                  // Use your googleBooksApi utility here
                  const bookData = await googleBooksApi.getBookById(item.contentId);

                  if (bookData && bookData.volumeInfo) {
                    const volumeInfo = bookData.volumeInfo;
                    itemDetails = {
                      _id: item._id,
                      id: bookData.id.toString(),
                      title: volumeInfo.title,
                      type: "book",
                      // Use the getBookImageUrl helper for consistency
                      poster: getBookImageUrl(bookData, 'thumbnail'),
                      rating: volumeInfo.averageRating || 0,
                      year: volumeInfo.publishedDate
                        ? parseInt(volumeInfo.publishedDate.substring(0, 4))
                        : 0,
                      addedDate: item.createdAt,
                      genres: volumeInfo.categories || [],
                      status: item.status,
                      progress: item.progress,
                      notes: item.notes,
                      startDate: item.startDate,
                      completedDate: item.completedDate,
                    };
                  }
                  break;
                default:
                  console.warn(
                    `Unknown content type: ${item.contentType} for contentId: ${item.contentId}`
                  );
                  break;
              }
            } catch (detailError: any) {
              console.error(
                `Failed to fetch details for ${item.contentType} with ID ${item.contentId}:`,
                detailError
              );
              // Return null for items that failed to fetch details, they will be filtered out.
              // You might want to log these or show a placeholder in the UI.
              return null;
            }
            return itemDetails;
          }
        );

        // Filter out any null results from Promise.allSettled if an item's details couldn't be fetched
        const results = await Promise.allSettled(detailedReadlistPromises);
        const fetchedReadlist: DisplayReadlistItem[] = results
          .filter(
            (result) => result.status === "fulfilled" && result.value !== null
          )
          .map((result) => (result as PromiseFulfilledResult<DisplayReadlistItem | null>).value as DisplayReadlistItem);

        setReadlist(fetchedReadlist);
        console.log("Processed readlist for display:", fetchedReadlist);
      } catch (err: any) {
        console.error("Error in fetchReadlistAndDetails:", err);
        setError(err.message || "Failed to load readlist.");
        toast({
          title: "Error",
          description: err.message || "Failed to load readlist. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchReadlistAndDetails();
  }, []); // Empty dependency array means this runs once on mount

  // Function to remove a readlist item from both frontend state and backend
  const removeReadlistItem = async (readlistRecordId: string) => {
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

      const response = await fetch("/api/readlist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify({
          _id: readlistRecordId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error response on remove readlist item:", errorData);
        throw new Error(errorData.error || "Failed to remove item from readlist");
      }

      setReadlist((prev) => prev.filter((item) => item._id !== readlistRecordId));
      toast({ title: "Removed from readlist!" });
    } catch (err: any) {
      console.error("Error removing readlist item:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to remove item from readlist.",
        variant: "destructive",
      });
    }
  };

  // Function to update the status of a readlist item
  const updateReadlistItemStatus = async (
    readlistRecordId: string,
    newStatus: DisplayReadlistItem["status"]
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

      const response = await fetch("/api/readlist", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify({
          _id: readlistRecordId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error response on update readlist status:", errorData);
        throw new Error(errorData.error || "Failed to update item status");
      }

      // Update local state
      setReadlist((prev) =>
        prev.map((item) =>
          item._id === readlistRecordId ? { ...item, status: newStatus } : item
        )
      );
      toast({ title: "Readlist status updated!" });
    } catch (err: any) {
      console.error("Error updating readlist status:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to update item status.",
        variant: "destructive",
      });
    }
  };

  // Placeholder for adding to readlist (you'd typically trigger this from search results/detail pages)
  const handleAddToReadlist = async (
    contentId: string,
    contentType: "manga" | "book",
    title: string,
    poster?: string // Optional poster
  ) => {
    try {
      const sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        toast({
          title: "Error",
          description: "No session found. Please log in to add to readlist.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/readlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify({
          contentId,
          contentType,
          title,
          poster,
          status: "plan-to-read",
        }), // Default status when adding
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error adding to readlist:", errorData);
        if (response.status === 409) {
          toast({
            title: "Already in Readlist",
            description: "This item is already in your readlist.",
            variant: "default",
          });
        } else {
          throw new Error(errorData.error || "Failed to add to readlist");
        }
      } else {
        const newItem = await response.json();
        setReadlist((prev) => [
          {
            _id: newItem._id,
            id: newItem.contentId,
            title: newItem.title,
            type: newItem.contentType,
            poster: newItem.poster || "/placeholder.svg",
            rating: newItem.rating || 0,
            year: 0, // Will be fetched with details if re-fetching, or needs to be set on POST
            addedDate: newItem.createdAt,
            genres: [], // Will be fetched with details if re-fetching, or needs to be set on POST
            status: newItem.status,
            progress: newItem.progress,
            notes: newItem.notes,
            startDate: newItem.startDate,
            completedDate: newItem.completedDate,
          },
          ...prev,
        ]);
        toast({ title: "Added to readlist!" });
        // Optionally, re-fetch all for full details (or implement a way to fetch details for just the new item)
        // fetchReadlistAndDetails(); // Uncomment if you want immediate full details refresh
      }
    } catch (err: any) {
      console.error("Error adding to readlist:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to add to readlist.",
        variant: "destructive",
      });
    }
  };

  const filteredReadlist = readlist.filter(
    (item) =>
      (selectedType === "all" || item.type === selectedType) &&
      (selectedStatus === "all" || item.status === selectedStatus)
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case "manga":
        return "bg-pink-600";
      case "book":
        return "bg-teal-600";
      default:
        return "bg-gray-600";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "manga":
        return "Manga";
      case "book":
        return "Book";
      default:
        return type;
    }
  };

  const getStatusColor = (status: DisplayReadlistItem["status"]) => {
    switch (status) {
      case "plan-to-read":
        return "bg-gray-500";
      case "reading":
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

  const getStatusLabel = (status: DisplayReadlistItem["status"]) => {
    switch (status) {
      case "plan-to-read":
        return "Plan to Read";
      case "reading":
        return "Reading";
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

  const getStatusIcon = (status: DisplayReadlistItem["status"]) => {
    switch (status) {
      case "plan-to-read":
        return <Clock className="h-3 w-3 mr-1" />;
      case "reading":
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
  console.log(isUserLoggedIn)
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

       {/* Header */}
       <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-30">
         <div className="container mx-auto px-4 py-4">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-4 ml-12">
               <h1 className="text-2xl font-bold text-white">AniMov</h1>
             </div>
 
           </div>
         </div>
       </header>

      {/* Main Content Area for Readlist Page */}
      <div className="relative z-10">
        {/* Readlist Section Header with Filtering */}
        <header className="bg-black/20 backdrop-blur-md border-b border-white/10 pt-20 pb-6">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <BookOpen className="h-8 w-8 text-pink-500" />
                <div>
                  <h1 className="text-3xl font-bold text-white">Readlist</h1>
                  <p className="text-gray-400">Books and Manga you plan to read or are currently reading</p>
                </div>
              </div>
              <Badge variant="outline" className="text-white border-white/20">
                {filteredReadlist.length} items
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
      {["all", "manga", "book"].map((type) => (
        <option key={type} value={type}>
          {type === "all" ? "All Types" : getTypeLabel(type)}
        </option>
      ))}
    </select>

    {/* Status Dropdown */}
    <select
      value={selectedStatus}
      onChange={(e) =>
        setSelectedStatus(e.target.value as DisplayReadlistItem["status"] | "all")
      }
      className="bg-white/10 border border-white/20 text-white p-2 rounded"
    >
      {["all", "plan-to-read", "reading", "completed", "on-hold", "dropped"].map((status) => (
        <option key={status} value={status}>
          {status === "all" ? "All Statuses" : getStatusLabel(status as DisplayReadlistItem["status"])}
        </option>
      ))}
    </select>
  </div>

  {/* Desktop Buttons */}
  <div className="hidden md:flex gap-2 flex-wrap">
    {["all", "manga", "book"].map((type) => (
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
    {["all", "plan-to-read", "reading", "completed", "on-hold", "dropped"].map((status) => (
      <Button
        key={status}
        variant={selectedStatus === status ? "default" : "outline"}
        size="sm"
        onClick={() =>
          setSelectedStatus(status as DisplayReadlistItem["status"] | "all")
        }
        className={
          selectedStatus === status
            ? "bg-indigo-600 hover:bg-indigo-700"
            : "bg-white/10 border-white/20 text-white hover:bg-white/20"
        }
      >
        {status === "all" ? "All Statuses" : getStatusLabel(status as DisplayReadlistItem["status"])}
      </Button>
    ))}
  </div>
</div>

          </div>
        </header>

        {/* Readlist Grid */}
        <div className="container mx-auto px-4 py-8">
          {filteredReadlist.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Your readlist is empty</h3>
              <p className="text-gray-400">Start adding books or manga to your readlist</p>
            
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
              {filteredReadlist.map((item) => (
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
                        {item.rating !== undefined && item.rating > 0 && (
                           <Badge className="bg-yellow-500 text-black">
                              <Star className="h-3 w-3 mr-1" />
                              {item.rating.toFixed(1)}
                           </Badge>
                        )}
                      </div>
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <Badge className={`${getTypeColor(item.type)} text-white`}>
                          {item.type === "manga" ? (
                            <PenTool className="h-3 w-3 mr-1" />
                          ) : (
                            <Book className="h-3 w-3 mr-1" />
                          )}
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
                          onClick={() => removeReadlistItem(item._id)}
                          className="bg-red-600 hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-white mb-2 line-clamp-2">{item.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                        {item.year && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {item.year}
                          </div>
                        )}
                        <div className="text-xs">
                          Added {new Date(item.addedDate).toLocaleDateString()}
                        </div>
                      </div>
                      {item.progress && item.progress.current !== undefined && item.progress.unit && (
                        <div className="text-sm text-gray-300 mb-2">
                          Progress: {item.progress.current}
                          {item.progress.total ? ` / ${item.progress.total}` : ""}{" "}
                          {item.progress.unit}
                        </div>
                      )}
                      {item.notes && (
                         <div className="text-sm text-gray-300 mb-2 line-clamp-2">
                            Notes: {item.notes}
                         </div>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {item.genres?.slice(0, 2).map((genre, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                   <div className="mt-3 flex flex-wrap gap-2 justify-center">
  {/* Status Update Buttons */}
  {item.status !== 'reading' && (
    <Button
      size="sm"
      onClick={() => updateReadlistItemStatus(item._id, "reading")}
      className="w-full sm:w-auto"
    >
      Reading
    </Button>
  )}
  {item.status !== 'completed' && (
    <Button
      size="sm"
      onClick={() => updateReadlistItemStatus(item._id, "completed")}
      className="w-full sm:w-auto"
    >
      Completed
    </Button>
  )}
  {item.status !== 'plan-to-read' && (
    <Button
      size="sm"
      variant="secondary"
      onClick={() => updateReadlistItemStatus(item._id, "plan-to-read")}
      className="w-full sm:w-auto"
    >
      Plan
    </Button>
  )}
  {item.status !== 'on-hold' && (
    <Button
      size="sm"
      variant="secondary"
      onClick={() => updateReadlistItemStatus(item._id, "on-hold")}
      className="w-full sm:w-auto"
    >
      On Hold
    </Button>
  )}
  {item.status !== 'dropped' && (
    <Button
      size="sm"
      variant="destructive"
      onClick={() => updateReadlistItemStatus(item._id, "dropped")}
      className="w-full sm:w-auto"
    >
      Dropped
    </Button>
  )}
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