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
    <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-lg shadow-xl text-white max-w-md mx-auto my-12">
      <Lock className="h-16 w-16 text-red-400 mb-6" />
      <h2 className="text-3xl font-bold mb-4 text-center">
        Access Exclusive Features!
      </h2>
      <p className="text-lg text-center mb-8 opacity-90">
        Sign in or create an account to curate your personal{" "}
        <span className="font-semibold text-red-300">Favorites</span>,{" "}
        <span className="font-semibold text-blue-300">Watchlist</span>, and{" "}
        <span className="font-semibold text-green-300">Readlist</span>.
      </p>

      <div className="flex space-x-4 mb-8">
        <div className="flex flex-col items-center">
          <Heart className="h-8 w-8 text-red-500" />
          <span className="text-sm mt-1">Favorites</span>
        </div>
        <div className="flex flex-col items-center">
          <Clock className="h-8 w-8 text-blue-500" />
          <span className="text-sm mt-1">Watchlist</span>
        </div>
        <div className="flex flex-col items-center">
          <BookOpen className="h-8 w-8 text-green-500" />
          <span className="text-sm mt-1">Readlist</span>
        </div>
        {/* You could add more icons here if you want to highlight other benefits */}
        <div className="flex flex-col items-center">
          <Star className="h-8 w-8 text-yellow-500" />
          <span className="text-sm mt-1">Ratings</span>
        </div>
        <div className="flex flex-col items-center">
          <Share2 className="h-8 w-8 text-purple-500" />
          <span className="text-sm mt-1">Sharing</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto">
          <Link href="/auth/signin">
            <LogIn className="mr-2 h-5 w-5" /> Sign In
          </Link>
        </Button>
        <Button asChild variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto">
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