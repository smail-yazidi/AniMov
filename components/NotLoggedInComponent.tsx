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

// Categories and list types
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

// Feature card component
function Feature({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <Icon className={`w-6 h-6 mb-1 ${color}`} />
      <span className="text-sm text-white">{label}</span>
    </div>
  );
}

export default function NotLoggedInComponent() {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [listTypeIndex, setListTypeIndex] = useState(0);
  const [typedCategory, setTypedCategory] = useState("");
  const [typedList, setTypedList] = useState("");

  const categoryTimeoutRef = useRef<any>(null);
  const listTimeoutRef = useRef<any>(null);

  const typeText = (
    textToType: string,
    setter: (value: string) => void,
    currentIndexSetter: (fn: (prev: number) => number) => void,
    totalItemsLength: number,
    timeoutRef: any,
    typePrefix: string
  ) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setter(""); // Reset text
    if (!textToType.length) {
      timeoutRef.current = setTimeout(() => {
        currentIndexSetter((prev) => (prev + 1) % totalItemsLength);
      }, 1500);
      return;
    }

    let charIndex = 0;

    const typeNextChar = () => {
      if (charIndex < textToType.length) {
        setter((prev) => prev + textToType[charIndex]);
        charIndex++;
        timeoutRef.current = setTimeout(typeNextChar, 100);
      } else {
        timeoutRef.current = setTimeout(() => {
          currentIndexSetter((prev) => (prev + 1) % totalItemsLength);
        }, 1500);
      }
    };

    typeNextChar();
  };

  useEffect(() => {
    const currentCategoryName = categories[categoryIndex].name;
    typeText(
      currentCategoryName,
      setTypedCategory,
      setCategoryIndex,
      categories.length,
      categoryTimeoutRef,
      "Category"
    );

    return () => {
      if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
    };
  }, [categoryIndex]);

  useEffect(() => {
    const currentListName = listTypes[listTypeIndex].name;
    typeText(
      currentListName,
      setTypedList,
      setListTypeIndex,
      listTypes.length,
      listTimeoutRef,
      "List"
    );

    return () => {
      if (listTimeoutRef.current) clearTimeout(listTimeoutRef.current);
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
        <Button asChild className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90">
          <Link href="/sign-in">
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Link>
        </Button>
      </div>
    </div>
  );
}
