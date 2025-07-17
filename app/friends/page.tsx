"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Search, UserPlus, MessageCircle, UserCheck, UserX} from "lucide-react"
import { Sidebar } from "@/components/sidebar"

interface Friend {
  id: string
  username: string
  displayName: string
  avatar: string
  status: "online" | "offline" | "away"
  mutualFriends: number
  favoriteGenres: string[]
  recentActivity: string
  joinDate: string
}

interface FriendRequest {
  id: string
  username: string
  displayName: string
  avatar: string
  mutualFriends: number
  requestDate: string
}

const mockFriends: Friend[] = [
  {
    id: "1",
    username: "anime_lover_2024",
    displayName: "Alex Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
    mutualFriends: 12,
    favoriteGenres: ["Anime", "Manga"],
    recentActivity: "Watched Attack on Titan S4",
    joinDate: "2023-06-15",
  },
  {
    id: "2",
    username: "movie_buff",
    displayName: "Sarah Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "offline",
    mutualFriends: 8,
    favoriteGenres: ["Movies", "Series"],
    recentActivity: "Added Dune to watchlist",
    joinDate: "2023-08-22",
  },
  {
    id: "3",
    username: "bookworm_reader",
    displayName: "Mike Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "away",
    mutualFriends: 5,
    favoriteGenres: ["Books", "Manga"],
    recentActivity: "Finished reading 1984",
    joinDate: "2023-09-10",
  },
]

const mockRequests: FriendRequest[] = [
  {
    id: "1",
    username: "new_user_123",
    displayName: "Emma Davis",
    avatar: "/placeholder.svg?height=40&width=40",
    mutualFriends: 3,
    requestDate: "2024-01-20",
  },
  {
    id: "2",
    username: "otaku_master",
    displayName: "Yuki Tanaka",
    avatar: "/placeholder.svg?height=40&width=40",
    mutualFriends: 7,
    requestDate: "2024-01-19",
  },
]

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>(mockFriends)
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(mockRequests)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredFriends = friends.filter(
    (friend) =>
      friend.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const acceptRequest = (id: string) => {
    const request = friendRequests.find((req) => req.id === id)
    if (request) {
      const newFriend: Friend = {
        id: request.id,
        username: request.username,
        displayName: request.displayName,
        avatar: request.avatar,
        status: "offline",
        mutualFriends: request.mutualFriends,
        favoriteGenres: ["Movies"],
        recentActivity: "Just joined your friends list",
        joinDate: new Date().toISOString().split("T")[0],
      }
      setFriends([...friends, newFriend])
      setFriendRequests(friendRequests.filter((req) => req.id !== id))
    }
  }

  const rejectRequest = (id: string) => {
    setFriendRequests(friendRequests.filter((req) => req.id !== id))
  }

  const removeFriend = (id: string) => {
    setFriends(friends.filter((friend) => friend.id !== id))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "online":
        return "Online"
      case "away":
        return "Away"
      case "offline":
        return "Offline"
      default:
        return "Unknown"
    }
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

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
               
              >
                <Search className="h-5 w-5" />
              </Button>

   
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-black/20 backdrop-blur-md border-b border-white/10 pt-20 pb-6">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <h1 className="text-3xl font-bold text-white">Friends</h1>
                  <p className="text-gray-400">Connect with fellow entertainment enthusiasts</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-white border-white/20">
                  {friends.length} friends
                </Badge>
                {friendRequests.length > 0 && (
                  <Badge className="bg-red-600 text-white">{friendRequests.length} requests</Badge>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search friends..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="friends" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/10 border-white/20">
              <TabsTrigger value="friends" className="text-white data-[state=active]:bg-purple-600">
                Friends ({friends.length})
              </TabsTrigger>
              <TabsTrigger value="requests" className="text-white data-[state=active]:bg-purple-600">
                Requests ({friendRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="mt-6">
              {filteredFriends.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {searchTerm ? "No friends found" : "No friends yet"}
                  </h3>
                  <p className="text-gray-400">
                    {searchTerm ? "Try a different search term" : "Start connecting with other users"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFriends.map((friend) => (
                    <Card
                      key={friend.id}
                      className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={friend.avatar || "/placeholder.svg"} alt={friend.displayName} />
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                  {friend.displayName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(friend.status)}`}
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{friend.displayName}</h3>
                              <p className="text-sm text-gray-400">@{friend.username}</p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getStatusColor(friend.status)} border-0 text-white`}
                          >
                            {getStatusLabel(friend.status)}
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Users className="h-4 w-4" />
                            {friend.mutualFriends} mutual friends
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {friend.favoriteGenres.map((genre, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {genre}
                              </Badge>
                            ))}
                          </div>

                          <p className="text-sm text-gray-300">{friend.recentActivity}</p>

                          <div className="flex gap-2 pt-2">
                            <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFriend(friend.id)}
                              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="requests" className="mt-6">
              {friendRequests.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No friend requests</h3>
                  <p className="text-gray-400">You're all caught up with friend requests</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {friendRequests.map((request) => (
                    <Card
                      key={request.id}
                      className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={request.avatar || "/placeholder.svg"} alt={request.displayName} />
                            <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                              {request.displayName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-white">{request.displayName}</h3>
                            <p className="text-sm text-gray-400">@{request.username}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Users className="h-4 w-4" />
                            {request.mutualFriends} mutual friends
                          </div>

                          <p className="text-xs text-gray-500">
                            Sent {new Date(request.requestDate).toLocaleDateString()}
                          </p>

                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() => acceptRequest(request.id)}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectRequest(request.id)}
                              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
