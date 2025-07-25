"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
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
  Users,
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
  const [typedCategory, setTypedCategory] = useState("");
  const [typedList, setTypedList] = useState("");

  const categoryTimeoutRef = useRef(null);
  const listTimeoutRef = useRef(null);

  // Helper function for typing effect (reusable)
  const typeText = (
    textToType,
    setter,
    currentIndexSetter,
    totalItemsLength,
    timeoutRef,
    typePrefix // Added for console logging clarity (e.g., "Category", "List")
  ) => {
    let charIndex = 0;
    setter(""); // Clear the text at the beginning of a new word

    console.log(`[${typePrefix} Effect] Starting new typing sequence for: "${textToType}"`);

    const typeNextChar = () => {
      console.log(`[${typePrefix} Timer] charIndex: ${charIndex}, textToType.length: ${textToType.length}`);

      if (charIndex < textToType.length) {
        // Only append if there's a character to append
        setter((prev) => {
          const newText = prev + textToType[charIndex];
          console.log(`[${typePrefix} Typing] Appending "${textToType[charIndex]}", current typed: "${newText}"`);
          return newText;
        });
        charIndex++;
        timeoutRef.current = setTimeout(typeNextChar, 100); // Schedule next char
      } else {
        // Word is fully typed
        console.log(`[${typePrefix} Finished] Word "${textToType}" fully typed.`);
        timeoutRef.current = setTimeout(() => {
          console.log(`[${typePrefix} Next Item] Moving to next item.`);
          currentIndexSetter((prev) => (prev + 1) % totalItemsLength);
        }, 1500); // Delay before moving to next item
      }
    };

    // Start typing immediately
    typeNextChar();
  };

  // Effect for typing categories
  useEffect(() => {
    const currentCategoryName = categories[categoryIndex].name;
    console.log(`[Category Effect] useEffect triggered for categoryIndex: ${categoryIndex}, word: "${currentCategoryName}"`);

    if (categoryTimeoutRef.current) {
      console.log("[Category Effect] Clearing previous category timeout.");
      clearTimeout(categoryTimeoutRef.current);
    }

    typeText(
      currentCategoryName,
      setTypedCategory,
      setCategoryIndex,
      categories.length,
      categoryTimeoutRef,
      "Category" // Pass prefix for logging
    );

    return () => {
      console.log("[Category Effect] Cleanup: Clearing category timeout on unmount/re-render.");
      if (categoryTimeoutRef.current) {
        clearTimeout(categoryTimeoutRef.current);
      }
    };
  }, [categoryIndex]);

  // Effect for typing list types
  useEffect(() => {
    const currentListName = listTypes[listTypeIndex].name;
    console.log(`[List Effect] useEffect triggered for listTypeIndex: ${listTypeIndex}, word: "${currentListName}"`);

    if (listTimeoutRef.current) {
      console.log("[List Effect] Clearing previous list timeout.");
      clearTimeout(listTimeoutRef.current);
    }

    typeText(
      currentListName,
      setTypedList,
      setListTypeIndex,
      listTypes.length,
      listTimeoutRef,
      "List" // Pass prefix for logging
    );

    return () => {
      console.log("[List Effect] Cleanup: Clearing list timeout on unmount/re-render.");
      if (listTimeoutRef.current) {
        clearTimeout(listTimeoutRef.current);
      }
    };
  }, [listTypeIndex]);

  const CurrentCategory = categories[categoryIndex];
  const CurrentList = listTypes[listTypeIndex];

  const CategoryIcon = CurrentCategory.icon;
  const ListIcon = CurrentList.icon;

  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-white max-w-2xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-4 leading-snug text-white">
        All Your Favorites{" "}
        <span className={`inline-flex items-center gap-2 ${CurrentCategory.color}`}>
          <CategoryIcon className="w-6 h-6" />
          <span className="min-w-min">{typedCategory}</span>
        </span>
      </h1>

      <p className="text-lg text-gray-300 max-w-xl min-h-[3rem]">
        Sign in or create an account to manage your personal{" "}
        <span className={`inline-flex items-center gap-1 ${CurrentList.color}`}>
          <ListIcon className="w-5 h-5" />
          <span className="min-w-min">{typedList}</span>
        </span>
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 my-8 w-full max-w-xs">
        <Feature icon={Heart} label="Favorites" color="text-red-500" />
        <Feature icon={Clock} label="Watchlist" color="text-blue-500" />
        <Feature icon={BookOpen} label="Readlist" color="text-green-500" />
        <Feature icon={Star} label="Ratings" color="text-yellow-500" />
        <Feature icon={Share2} label="Sharing" color="text-purple-500" />
        <Feature icon={Users} label="Friends" color="text-pink-400" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <Button asChild className="w-full text-white bg-[hsl(328.1,78.4%,60%)]">
          <Link href="/auth/signin">
            <LogIn className="mr-2 h-5 w-5" /> Sign In
          </Link>
        </Button>
        <Button asChild className="w-full text-white bg-[hsl(328.1,78.4%,60%)] border-none">
          <Link href="/auth/signup">Create Account</Link>
        </Button>
      </div>

      <p className="mt-8 text-sm opacity-75">It's quick, easy, and completely free!</p>
    </div>
  );
}

function Feature({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <Icon className={`h-8 w-8 ${color}`} />
      <span className="text-sm mt-1 text-gray-300">{label}</span>
    </div>
  );
}