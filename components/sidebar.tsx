"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, Heart, Clock, Users, Film, Tv, Play, BookOpen, Settings, Menu, X, Book } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navigationItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Heart, label: "Favorites", href: "/favorites" },
  { icon: Clock, label: "Watchlist", href: "/watchlist" },
  { icon: BookOpen, label: "Readlist", href: "/readlist" },
  { icon: Users, label: "Friends", href: "/friends" },
  { type: "separator", label: "Explore" },
  { icon: Film, label: "Movies", href: "/movies" },
  { icon: Tv, label: "TV Series", href: "/series" },
  { icon: Play, label: "Anime", href: "/anime" },
  { icon: BookOpen, label: "Manga", href: "/manga" },
  { icon: Book, label: "Books", href: "/books" },
  { type: "separator" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

interface SidebarProps {
  className?: string
}

const getInitials = (name?: string) => {
  if (!name) return "?"
  const words = name.trim().split(" ")
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
  }
  return words[0].charAt(0).toUpperCase()
}

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const [user, setUser] = useState<{
    id: string
    email: string
    username?: string
    displayName?: string
    avatar?: string
  } | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const sessionId = localStorage.getItem("sessionId")
        if (!sessionId) {
          setUser(null)
          return
        }

        const res = await fetch("/api/auth/session", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionId}`,
          },
        })

        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        } else {
          setUser(null)
          localStorage.removeItem("sessionId")
        }
      } catch (error) {
        console.error("Error checking auth status:", error)
        setUser(null)
        localStorage.removeItem("sessionId")
      }
    }

    checkAuth()
  }, [])

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const closeSidebar = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Menu Button - Higher z-index */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-[100] text-white bg-black/20 backdrop-blur-md hover:bg-black/40 border border-white/10"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay - Higher z-index */}
      {isOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]" onClick={closeSidebar} />}

      {/* Sidebar - Higher z-index */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-black/20 backdrop-blur-md border-r border-white/10 z-[95] transition-all duration-300 flex flex-col transform",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className,
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Play className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">AniMov</h2>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item, index) => {
            if (item.type === "separator") {
              return (
                <div key={index} className="py-2">
                  {item.label && (
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider px-2 mb-2">
                      {item.label}
                    </p>
                  )}
                </div>
              )
            }

            const Icon = item.icon!
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href!} onClick={closeSidebar}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 text-gray-300 hover:text-white hover:bg-white/10 transition-colors",
                    isActive && "bg-white/10 text-white",
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        {user ? (
          <div className="p-4 border-t border-white/10">
            <Link href="/profile" onClick={closeSidebar}>
              <div className="flex items-center gap-3 hover:bg-white/10 rounded-lg p-2 transition-colors cursor-pointer">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar || "/placeholder-user.jpg"} alt="User" />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                    {getInitials(user.displayName || user.username || user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {user.displayName || user.username || user.email.split('@')[0]}
                  </p>
                  {user.username && (
                    <p className="text-gray-400 text-xs truncate">@{user.username}</p>
                  )}
                </div>
              </div>
            </Link>
          </div>
        ) : (
          <div className="p-4 border-t border-white/10">
            <Link href="/auth/signin" onClick={closeSidebar}>
              <Button variant="outline" className="w-full"    style={{ backgroundColor: "hsl(328.1, 78.4%, 60%)", color: "white" }}>
                Sign In
              </Button>
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}