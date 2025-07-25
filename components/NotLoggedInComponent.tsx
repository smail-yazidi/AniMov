// components/NotLoggedInComponent.tsx
"use client";

import Link from "next/link";
import { Lock, LogIn, Heart, Clock, BookOpen, Star, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function NotLoggedInComponent() {
  // Optional: You could add state here if you wanted to dynamically change
  // the message, e.g., based on a prop indicating what feature they tried to access.
  const [message, setMessage] = useState("Unlock more features by logging in!");

  useEffect(() => {
    // This useEffect is currently not doing much, but it's a good pattern
    // if you later decide to fetch data or perform side effects on mount.
    // For now, we'll just keep it simple.
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8  text-white max-w-lg mx-auto my-12 ">
    <h1 class="text-4xl md:text-6xl font-bold text-white mb-4">Movies, TV Series, Anime, Manga, and Books - Everything you need in one place</h1> 
      <p className="text-lg text-center mb-8 opacity-90">
        Sign in or create an account to create your personal{" "}
        <span className="font-semibold text-red-300">Favorites</span>,{" "}
        <span className="font-semibold text-blue-300">Watchlist</span>, and{" "}
        <span className="font-semibold text-green-300">Readlist</span>.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8 w-full max-w-xs"> {/* Adjusted for better layout */}
        <div className="flex flex-col items-center">
          <Heart className="h-8 w-8 text-red-500" />
          <span className="text-sm mt-1 text-gray-300">Favorites</span>
        </div>
        <div className="flex flex-col items-center">
          <Clock className="h-8 w-8 text-blue-500" />
          <span className="text-sm mt-1 text-gray-300">Watchlist</span>
        </div>
        <div className="flex flex-col items-center">
          <BookOpen className="h-8 w-8 text-green-500" />
          <span className="text-sm mt-1 text-gray-300">Readlist</span>
        </div>
        <div className="flex flex-col items-center">
          <Star className="h-8 w-8 text-yellow-500" />
          <span className="text-sm mt-1 text-gray-300">Ratings</span>
        </div>
        <div className="flex flex-col items-center">
          <Share2 className="h-8 w-8 text-purple-500" />
          <span className="text-sm mt-1 text-gray-300">Sharing</span>
        </div>
        {/* Empty div for grid alignment if needed for 2-column layout on small screens */}
        <div className="hidden sm:flex" /> 
      </div>
<div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
  <Button
    asChild
    className="w-full text-white bg-[hsl(328.1,78.4%,60%)] hover:brightness-110"
  >
    <Link href="/auth/signin">
      <LogIn className="mr-2 h-5 w-5" /> Sign In
    </Link>
  </Button>

  <Button
    asChild
    variant="outline"
    className="w-full text-white bg-[hsl(328.1,78.4%,60%)] hover:brightness-110 border-none"
  >
    <Link href="/auth/signup">
      Create Account
    </Link>
  </Button>
</div>


      <p className="mt-8 text-sm opacity-75">
        It's quick, easy, and completely free!
      </p>
    </div>
  );
}