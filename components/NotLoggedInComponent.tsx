"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react"; // Import useRef
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

  // Use refs to store timeout IDs so we can clear them reliably
  const categoryTimeoutRef = useRef(null);
  const listTimeoutRef = useRef(null);

  // Helper function for typing effect (reusable)
  const typeText = (
    textToType,
    setter,
    currentIndexSetter,
    totalItemsLength,
    timeoutRef
  ) => {
    let charIndex = 0;
    setter(""); // Clear the text at the beginning of a new word

    const typeNextChar = () => {
      if (charIndex < textToType.length) {
        setter((prev) => prev + textToType[charIndex]);
        charIndex++;
        timeoutRef.current = setTimeout(typeNextChar, 100); // Schedule next char
      } else {
        // Word is fully typed, wait, then move to next item
        timeoutRef.current = setTimeout(() => {
          currentIndexSetter((prev) => (prev + 1) % totalItemsLength);
        }, 1500);
      }
    };

    typeNextChar(); // Start typing immediately
  };

  // Effect for typing categories
  useEffect(() => {
    const currentCategoryName = categories[categoryIndex].name;

    // Clear any existing timeout from a previous cycle before starting a new one
    if (categoryTimeoutRef.current) {
      clearTimeout(categoryTimeoutRef.current);
    }

    typeText(
      currentCategoryName,
      setTypedCategory,
      setCategoryIndex,
      categories.length,
      categoryTimeoutRef
    );

    // Cleanup function: ensures timeout is cleared when component unmounts
    // or when categoryIndex changes (and effect re-runs)
    return () => {
      if (categoryTimeoutRef.current) {
        clearTimeout(categoryTimeoutRef.current);
      }
    };
  }, [categoryIndex]); // Dependency array: re-run when categoryIndex changes

  // Effect for typing list types
  useEffect(() => {
    const currentListName = listTypes[listTypeIndex].name;

    // Clear any existing timeout
    if (listTimeoutRef.current) {
      clearTimeout(listTimeoutRef.current);
    }

    typeText(
      currentListName,
      setTypedList,
      setListTypeIndex,
      listTypes.length,
      listTimeoutRef
    );

    // Cleanup function
    return () => {
      if (listTimeoutRef.current) {
        clearTimeout(listTimeoutRef.current);
      }
    };
  }, [listTypeIndex]); // Dependency array: re-run when listTypeIndex changes

  const CurrentCategory = categories[categoryIndex];
  const CurrentList = listTypes[listTypeIndex];

  // Destructure the icon components for easier use in JSX
  const CategoryIcon = CurrentCategory.icon;
  const ListIcon = CurrentList.icon;

  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-white max-w-2xl mx-auto text-center">
      {/* Heading with typing effect */}
      <h1 className="text-3xl font-bold mb-4 leading-snug text-white">
        All Your Favorites{" "}
        <span className={`inline-flex items-center gap-2 ${CurrentCategory.color}`}>
          <CategoryIcon className="w-6 h-6" />
          {/* Using min-w-min to ensure space for the word even if it's short */}
          <span className="min-w-min">{typedCategory}</span>
        </span>
      </h1>

      {/* Sign-in sentence with list typing */}
      <p className="text-lg text-gray-300 max-w-xl min-h-[3rem]">
        Sign in or create an account to manage your personal{" "}
        <span className={`inline-flex items-center gap-1 ${CurrentList.color}`}>
          <ListIcon className="w-5 h-5" />
          <span className="min-w-min">{typedList}</span>
        </span>
      </p>

      {/* Feature icons grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 my-8 w-full max-w-xs">
        <Feature icon={Heart} label="Favorites" color="text-red-500" />
        <Feature icon={Clock} label="Watchlist" color="text-blue-500" />
        <Feature icon={BookOpen} label="Readlist" color="text-green-500" />
        <Feature icon={Star} label="Ratings" color="text-yellow-500" />
        <Feature icon={Share2} label="Sharing" color="text-purple-500" />
        <Feature icon={Users} label="Friends" color="text-pink-400" />
      </div>

      {/* Auth buttons */}
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