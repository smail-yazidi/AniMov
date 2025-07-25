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

  useEffect(() => {
    const current = categories[categoryIndex].name;
    let charIndex = 0; // Start at 0

    // Set the first character immediately to avoid "undefined" or missing first char
    if (current.length > 0) {
      setTypedCategory(current[charIndex]);
      charIndex++; // Increment for the next character to be typed
    } else {
      setTypedCategory(""); // Handle empty string case
    }


    const interval = setInterval(() => {
      if (charIndex < current.length) {
        setTypedCategory((prev) => prev + current[charIndex]);
        charIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setCategoryIndex((prev) => (prev + 1) % categories.length);
        }, 1500);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [categoryIndex]);

  useEffect(() => {
    const current = listTypes[listTypeIndex].name;
    let charIndex = 0; // Start at 0

    // Set the first character immediately
    if (current.length > 0) {
      setTypedList(current[charIndex]);
      charIndex++; // Increment for the next character to be typed
    } else {
      setTypedList(""); // Handle empty string case
    }


    const interval = setInterval(() => {
      if (charIndex < current.length) {
        setTypedList((prev) => prev + current[charIndex]);
        charIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setListTypeIndex((prev) => (prev + 1) % listTypes.length);
        }, 1500);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [listTypeIndex]);

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
          <span className="min-w-[6ch]">{typedCategory}</span>
        </span>
      </h1>

      {/* Sign-in sentence with list typing */}
      <p className="text-lg text-gray-300 max-w-xl min-h-[3rem]">
        Sign in or create an account to manage your personal{" "}
        <span className={`inline-flex items-center gap-1 ${CurrentList.color}`}>
          <ListIcon className="w-5 h-5" />
          <span className="min-w-[6ch]">{typedList}</span>
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