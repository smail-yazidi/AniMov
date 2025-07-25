"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
// Import BookOpen for readlist, assuming you've added it to your icon library
import { Settings, LogOut, User, Heart, Clock, Users, BookOpen } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

const getInitials = (name?: string) => {
  if (!name) return "?"
  const words = name.trim().split(" ")
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
  }
  return words[0].charAt(0).toUpperCase()
}

interface UserDropdownProps {
  className?: string
}

export function UserDropdown({ className }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<{
    id: string
    email: string
    username?: string
    displayName?: string
    avatar?: string
  } | null>(null)

  // State variables for counts, initialized to null to indicate 'not yet fetched'
  const [favoritesCount, setFavoritesCount] = useState<number | null>(null)
  const [friendsCount, setFriendsCount] = useState<number | null>(null) // Assuming you'll have a /api/friends/count route
  const [watchlistCount, setWatchlistCount] = useState<number | null>(null)
  const [readlistCount, setReadlistCount] = useState<number | null>(null)

  // Global loading state for the component
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Function to fetch all user-specific counts
  const fetchUserCounts = async (sessionId: string) => {
    try {
      // Fetch counts from the new combined API route
      const countsRes = await fetch("/api/count", {
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
      })

      if (countsRes.ok) {
        const data = await countsRes.json()
        setFavoritesCount(data.favoritesCount)
        // Note: You need a friends count endpoint or include it in /api/count if you want to display it
        // For now, setting to a placeholder if your /api/count doesn't return it
        setFriendsCount(data.friendsCount || 0) // Assume 0 if not returned by /api/count
        setWatchlistCount(data.watchlistCount)
        setReadlistCount(data.readlistCount)
      } else {
        console.error("Failed to fetch user counts:", await countsRes.json())
        // Reset counts to 0 on failure
        setFavoritesCount(0)
        setFriendsCount(0)
        setWatchlistCount(0)
        setReadlistCount(0)
      }
    } catch (error) {
      console.error("Error fetching user counts:", error)
      // Reset counts to 0 on network error
      setFavoritesCount(0)
      setFriendsCount(0)
      setWatchlistCount(0)
      setReadlistCount(0)
    }
  }

  // Effect to handle session check and data fetching
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      setIsLoading(true) // Start loading before any fetches

      try {
        const sessionId = localStorage.getItem("sessionId")
        if (!sessionId) {
          setUser(null)
          // No session, so no user or counts to display, stop loading
          setIsLoading(false)
          return
        }

        // 1. Fetch user session
        const userRes = await fetch("/api/auth/session", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionId}`,
          },
        })

        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData.user)
          // 2. If user session is valid, fetch all counts
          await fetchUserCounts(sessionId)
        } else {
          // If session invalid, clear local storage and reset user/counts
          setUser(null)
          localStorage.removeItem("sessionId")
          setFavoritesCount(null)
          setFriendsCount(null)
          setWatchlistCount(null)
          setReadlistCount(null)
        }
      } catch (error) {
        console.error("Error during authentication or data fetching:", error)
        setUser(null)
        localStorage.removeItem("sessionId")
        setFavoritesCount(null)
        setFriendsCount(null)
        setWatchlistCount(null)
        setReadlistCount(null)
      } finally {
        setIsLoading(false) // Always stop loading, regardless of success or failure
      }
    }

    checkAuthAndFetchData()
  }, []) // Empty dependency array means this runs only once on mount

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

  const handleLogout = () => {
    localStorage.removeItem("sessionId")
    setUser(null)
    setFavoritesCount(null)
    setFriendsCount(null)
    setWatchlistCount(null)
    setReadlistCount(null)
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    router.push("/auth/signin")
    setIsOpen(false)
  }

  // --- Render logic based on loading state ---
  if (isLoading) {
    // If loading, render nothing or a minimal placeholder like a skeleton avatar button
    // This ensures no UI is shown until data is fetched or it's confirmed no user is logged in.
    return (null
    );
  }

  if (!user) {
    // If not loading AND no user, show the Sign In button
    return (
  <Link href="/auth/signin">
  <Button
    style={{ backgroundColor: "hsl(328.1, 78.4%, 60%)", color: "white" }}
    className="ml-2 hover:brightness-110"
  >
    Sign In
  </Button>
</Link>

    )
  }

  // If not loading AND user is present, render the full dropdown
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className="p-1 rounded-full hover:bg-white/10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar className="w-8 h-8">
          <AvatarImage src={user.avatar || "/placeholder-user.jpg"} alt="User" />
          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
            {getInitials(user.displayName || user.username || user.email)}
          </AvatarFallback>
        </Avatar>
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-64 bg-slate-900/95 backdrop-blur-md border-white/20 shadow-xl z-50">
          <CardContent className="p-0">
            {/* User Info */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.avatar || "/placeholder-user.jpg"} alt="User" />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {getInitials(user.displayName || user.username || user.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-white font-semibold">
                    {user.displayName || user.username || user.email.split('@')[0]}
                  </h3>
                  {user.username && (
                    <p className="text-gray-400 text-sm">@{user.username}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="p-4 border-b border-white/10">
              <div className="grid grid-cols-2 gap-4 text-center"> {/* Changed to grid-cols-2 for 4 items */}
                <Link href="/watchlist" onClick={() => setIsOpen(false)}>
                  <div className="hover:bg-white/10 rounded-lg p-2 transition-colors cursor-pointer">
                    <Clock className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                    <div className="text-white font-semibold text-sm">
                      {watchlistCount !== null ? watchlistCount : "--"} {/* Display count or placeholder */}
                    </div>
                    <div className="text-gray-400 text-xs">Watchlist</div>
                  </div>
                </Link>
                <Link href="/readlist" onClick={() => setIsOpen(false)}>
                  <div className="hover:bg-white/10 rounded-lg p-2 transition-colors cursor-pointer">
                    <BookOpen className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
                    <div className="text-white font-semibold text-sm">
                      {readlistCount !== null ? readlistCount : "--"} {/* Display count or placeholder */}
                    </div>
                    <div className="text-gray-400 text-xs">Readlist</div>
                  </div>
                </Link>
                <Link href="/favorites" onClick={() => setIsOpen(false)}>
                  <div className="hover:bg-white/10 rounded-lg p-2 transition-colors cursor-pointer">
                    <Heart className="h-5 w-5 text-pink-400 mx-auto mb-1" />
                    <div className="text-white font-semibold text-sm">
                      {favoritesCount !== null ? favoritesCount : "--"} {/* Display count or placeholder */}
                    </div>
                    <div className="text-gray-400 text-xs">Favorites</div>
                  </div>
                </Link>
                <Link href="/friends" onClick={() => setIsOpen(false)}>
                  <div className="hover:bg-white/10 rounded-lg p-2 transition-colors cursor-pointer">
                    <Users className="h-5 w-5 text-green-400 mx-auto mb-1" />
                    <div className="text-white font-semibold text-sm">
                      {friendsCount !== null ? friendsCount : "--"} {/* Display count or placeholder */}
                    </div>
                    <div className="text-gray-400 text-xs">Friends</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <Link href="/profile" onClick={() => setIsOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-gray-300 hover:text-white hover:bg-white/10 h-10"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              </Link>

              <Link href="/settings" onClick={() => setIsOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-gray-300 hover:text-white hover:bg-white/10 h-10"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </Link>

              <div className="border-t border-white/10 my-2" />

              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 h-10"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}