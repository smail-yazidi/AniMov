"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Book,
  BookOpen,
  Clock,
  Film,
  Heart,
  LogIn,
  Play,
  Share2,
  Star,
  Tv,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { id: "movies", name: "Movies", icon: Film, color: "text-red-400" },
  { id: "series", name: "TV Series", icon: Tv, color: "text-blue-400" },
  { id: "anime", name: "Anime", icon: Play, color: "text-purple-400" },
  { id: "manga", name: "Manga", icon: BookOpen, color: "text-orange-400" },
  { id: "books", name: "Books", icon: Book, color: "text-green-400" },
];

const listTypes = [
  { name: "Favorites", icon: Heart, color: "text-red-400" },
  { name: "Watchlist", icon: Clock, color: "text-blue-400" },
  { name: "Readlist", icon: BookOpen, color: "text-green-400" },
];

export default function NotLoggedInComponent() {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [listTypeIndex, setListTypeIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCategoryIndex((prev) => (prev + 1) % categories.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setListTypeIndex((prev) => (prev + 1) % listTypes.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const CurrentCategory = categories[categoryIndex];
  const CurrentList = listTypes[listTypeIndex];

  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-white max-w-2xl mx-auto text-center">
      {/* Fixed heading with typing content inside */}
      <h1 className="text-3xl font-bold mb-4 leading-snug text-white">
        All Your Favorites —{" "}
        <span className={`inline-flex items-center gap-2 ${CurrentCategory.color}`}>
          <CurrentCategory.icon className="w-6 h-6" />
          {CurrentCategory.name}
        </span>
      </h1>

      {/* Typing effect for sign-in sentence */}
      <p className="text-lg text-gray-300 max-w-xl min-h-[3rem]">
        Sign in or create an account to manage your personal{" "}
        <span className={`inline-flex items-center gap-1 ${CurrentList.color}`}>
          <CurrentList.icon className="w-5 h-5" />
          {CurrentList.name}
        </span>
        .
      </p>

      {/* Feature Icons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 my-8 w-full max-w-xs">
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
        <div className="hidden sm:flex" />
      </div>

      {/* Auth Buttons (no hover effect) */}
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <Button
          asChild
          className="w-full text-white bg-[hsl(328.1,78.4%,60%)] brightness-100"
        >
          <Link href="/auth/signin">
            <LogIn className="mr-2 h-5 w-5" /> Sign In
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="w-full text-white bg-[hsl(328.1,78.4%,60%)] brightness-100 border-none"
        >
          <Link href="/auth/signup">Create Account</Link>
        </Button>
      </div>

      <p className="mt-8 text-sm opacity-75">
        It's quick, easy, and completely free!
      </p>
    </div>
  );
}
