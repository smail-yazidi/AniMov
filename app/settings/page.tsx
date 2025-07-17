"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings, User, Bell, Shield, Palette, Save } from "lucide-react"
import { Sidebar } from "@/components/sidebar"

interface UserSettings {
  profile: {
    displayName: string
    username: string
    email: string
    bio: string
    avatar: string
    location: string
    website: string
  }
  preferences: {
    language: string
    theme: string
    timezone: string
    dateFormat: string
  }
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    friendRequests: boolean
    newReleases: boolean
    recommendations: boolean
    weeklyDigest: boolean
  }
  privacy: {
    profileVisibility: string
    showWatchlist: boolean
    showFavorites: boolean
    allowFriendRequests: boolean
    showOnlineStatus: boolean
  }
}

const defaultSettings: UserSettings = {
  profile: {
    displayName: "John Doe",
    username: "johndoe",
    email: "john.doe@example.com",
    bio: "Entertainment enthusiast who loves anime, movies, and books!",
    avatar: "/placeholder.svg?height=100&width=100",
    location: "New York, USA",
    website: "https://johndoe.com",
  },
  preferences: {
    language: "en",
    theme: "dark",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    friendRequests: true,
    newReleases: true,
    recommendations: false,
    weeklyDigest: true,
  },
  privacy: {
    profileVisibility: "public",
    showWatchlist: true,
    showFavorites: true,
    allowFriendRequests: true,
    showOnlineStatus: true,
  },
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [hasChanges, setHasChanges] = useState(false)

  const updateProfile = (field: keyof UserSettings["profile"], value: string) => {
    setSettings((prev) => ({
      ...prev,
      profile: { ...prev.profile, [field]: value },
    }))
    setHasChanges(true)
  }

  const updatePreferences = (field: keyof UserSettings["preferences"], value: string) => {
    setSettings((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, [field]: value },
    }))
    setHasChanges(true)
  }

  const updateNotifications = (field: keyof UserSettings["notifications"], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value },
    }))
    setHasChanges(true)
  }

  const updatePrivacy = (field: keyof UserSettings["privacy"], value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, [field]: value },
    }))
    setHasChanges(true)
  }

  const saveSettings = () => {
    // Here you would typically save to a backend
    console.log("Saving settings:", settings)
    setHasChanges(false)
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
 

   
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-black/20 backdrop-blur-md border-b border-white/10 pt-20 pb-6">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Settings className="h-8 w-8 text-white" />
                <div>
                  <h1 className="text-3xl font-bold text-white">Settings</h1>
                  <p className="text-gray-400">Manage your account and preferences</p>
                </div>
              </div>
              {hasChanges && (
                <Button onClick={saveSettings} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 border-white/20">
              <TabsTrigger value="profile" className="text-white data-[state=active]:bg-purple-600">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="preferences" className="text-white data-[state=active]:bg-purple-600">
                <Palette className="h-4 w-4 mr-2" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-white data-[state=active]:bg-purple-600">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="text-white data-[state=active]:bg-purple-600">
                <Shield className="h-4 w-4 mr-2" />
                Privacy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="w-20 h-20">
                      <AvatarImage
                        src={settings.profile.avatar || "/placeholder.svg"}
                        alt={settings.profile.displayName}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl">
                        {settings.profile.displayName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                        Change Avatar
                      </Button>
                      <p className="text-sm text-gray-400 mt-1">JPG, PNG or GIF. Max size 2MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName" className="text-white">
                        Display Name
                      </Label>
                      <Input
                        id="displayName"
                        value={settings.profile.displayName}
                        onChange={(e) => updateProfile("displayName", e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-white">
                        Username
                      </Label>
                      <Input
                        id="username"
                        value={settings.profile.username}
                        onChange={(e) => updateProfile("username", e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={settings.profile.email}
                        onChange={(e) => updateProfile("email", e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-white">
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={settings.profile.location}
                        onChange={(e) => updateProfile("location", e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="website" className="text-white">
                        Website
                      </Label>
                      <Input
                        id="website"
                        value={settings.profile.website}
                        onChange={(e) => updateProfile("website", e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio" className="text-white">
                        Bio
                      </Label>
                      <textarea
                        id="bio"
                        value={settings.profile.bio}
                        onChange={(e) => updateProfile("bio", e.target.value)}
                        className="w-full min-h-[100px] px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="mt-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">App Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Language</Label>
                      <Select
                        value={settings.preferences.language}
                        onValueChange={(value) => updatePreferences("language", value)}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="ja">Japanese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Theme</Label>
                      <Select
                        value={settings.preferences.theme}
                        onValueChange={(value) => updatePreferences("theme", value)}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="auto">Auto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Timezone</Label>
                      <Select
                        value={settings.preferences.timezone}
                        onValueChange={(value) => updatePreferences("timezone", value)}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          <SelectItem value="Europe/London">GMT</SelectItem>
                          <SelectItem value="Asia/Tokyo">JST</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Date Format</Label>
                      <Select
                        value={settings.preferences.dateFormat}
                        onValueChange={(value) => updatePreferences("dateFormat", value)}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Email Notifications</Label>
                        <p className="text-sm text-gray-400">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={settings.notifications.emailNotifications}
                        onCheckedChange={(checked) => updateNotifications("emailNotifications", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Push Notifications</Label>
                        <p className="text-sm text-gray-400">Receive push notifications in browser</p>
                      </div>
                      <Switch
                        checked={settings.notifications.pushNotifications}
                        onCheckedChange={(checked) => updateNotifications("pushNotifications", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Friend Requests</Label>
                        <p className="text-sm text-gray-400">Get notified about new friend requests</p>
                      </div>
                      <Switch
                        checked={settings.notifications.friendRequests}
                        onCheckedChange={(checked) => updateNotifications("friendRequests", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">New Releases</Label>
                        <p className="text-sm text-gray-400">Notifications about new content releases</p>
                      </div>
                      <Switch
                        checked={settings.notifications.newReleases}
                        onCheckedChange={(checked) => updateNotifications("newReleases", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Recommendations</Label>
                        <p className="text-sm text-gray-400">Personalized content recommendations</p>
                      </div>
                      <Switch
                        checked={settings.notifications.recommendations}
                        onCheckedChange={(checked) => updateNotifications("recommendations", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Weekly Digest</Label>
                        <p className="text-sm text-gray-400">Weekly summary of your activity</p>
                      </div>
                      <Switch
                        checked={settings.notifications.weeklyDigest}
                        onCheckedChange={(checked) => updateNotifications("weeklyDigest", checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="mt-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Privacy Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Profile Visibility</Label>
                      <Select
                        value={settings.privacy.profileVisibility}
                        onValueChange={(value) => updatePrivacy("profileVisibility", value)}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="friends">Friends Only</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Show Watchlist</Label>
                        <p className="text-sm text-gray-400">Allow others to see your watchlist</p>
                      </div>
                      <Switch
                        checked={settings.privacy.showWatchlist}
                        onCheckedChange={(checked) => updatePrivacy("showWatchlist", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Show Favorites</Label>
                        <p className="text-sm text-gray-400">Allow others to see your favorites</p>
                      </div>
                      <Switch
                        checked={settings.privacy.showFavorites}
                        onCheckedChange={(checked) => updatePrivacy("showFavorites", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Allow Friend Requests</Label>
                        <p className="text-sm text-gray-400">Let others send you friend requests</p>
                      </div>
                      <Switch
                        checked={settings.privacy.allowFriendRequests}
                        onCheckedChange={(checked) => updatePrivacy("allowFriendRequests", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Show Online Status</Label>
                        <p className="text-sm text-gray-400">Display when you're online to friends</p>
                      </div>
                      <Switch
                        checked={settings.privacy.showOnlineStatus}
                        onCheckedChange={(checked) => updatePrivacy("showOnlineStatus", checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
