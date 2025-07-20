"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Settings, LogOut, User, Heart, Clock, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

// Helper function to get initials from name
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
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Check for logged-in user on component mount
useEffect(() => {
  const checkAuth = async () => {
    try {
      const sessionId = localStorage.getItem("sessionId")
      if (!sessionId) return

      const res = await fetch("/api/auth/session", {
        method: "GET",
        headers: { authorization: sessionId },
      })

      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Error checking auth status:", error)
      setUser(null)
    }
  }

  checkAuth()
}, [])

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

  // Close dropdown on escape key
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
  toast({
    title: "Logged out",
    description: "You have been successfully logged out.",
  })
  router.push("/auth/signin")
  setIsOpen(false)
}


  if (!user) {
    return (
      <Link href="/auth/signin">
        <Button variant="outline" className="ml-2">
          Sign In
        </Button>
      </Link>
    )
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Avatar Button */}
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

      {/* Dropdown Menu */}
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
              <div className="grid grid-cols-3 gap-4 text-center">
                <Link href="/watchlist" onClick={() => setIsOpen(false)}>
                  <div className="hover:bg-white/10 rounded-lg p-2 transition-colors cursor-pointer">
                    <Clock className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                    <div className="text-white font-semibold text-sm">0</div>
                    <div className="text-gray-400 text-xs">Watchlist</div>
                  </div>
                </Link>
                <Link href="/favorites" onClick={() => setIsOpen(false)}>
                  <div className="hover:bg-white/10 rounded-lg p-2 transition-colors cursor-pointer">
                    <Heart className="h-5 w-5 text-pink-400 mx-auto mb-1" />
                    <div className="text-white font-semibold text-sm">0</div>
                    <div className="text-gray-400 text-xs">Favorites</div>
                  </div>
                </Link>
                <Link href="/friends" onClick={() => setIsOpen(false)}>
                  <div className="hover:bg-white/10 rounded-lg p-2 transition-colors cursor-pointer">
                    <Users className="h-5 w-5 text-green-400 mx-auto mb-1" />
                    <div className="text-white font-semibold text-sm">0</div>
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
