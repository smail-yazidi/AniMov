"use client";

import Link from "next/link";
import { Lock, LogIn, Heart, Clock, BookOpen, Star, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const typingWords = ["Movies", "TV Shows", "Anime", "Manga", "Books"];
const typingPhrase = "Sign in or create an account to manage your personal Favorites, Watchlist, and Readlist.";

export default function NotLoggedInComponent() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typedWord, setTypedWord] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [typingPhraseIndex, setTypingPhraseIndex] = useState(0);

  // Typing effect for header
  useEffect(() => {
    const currentWord = typingWords[currentWordIndex];
    const timeout = setTimeout(() => {
      setTypedWord((prev) =>
        deleting ? prev.slice(0, -1) : currentWord.slice(0, prev.length + 1)
      );

      if (!deleting && typedWord === currentWord) {
        setTimeout(() => setDeleting(true), 1000);
      } else if (deleting && typedWord === "") {
        setDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % typingWords.length);
      }
    }, deleting ? 50 : 120);

    return () => clearTimeout(timeout);
  }, [typedWord, deleting, currentWordIndex]);

  // Typing effect for paragraph
  useEffect(() => {
    if (typingPhraseIndex < typingPhrase.length) {
      const timeout = setTimeout(() => {
        setTypingText((prev) => prev + typingPhrase[typingPhraseIndex]);
        setTypingPhraseIndex((prev) => prev + 1);
      }, 30);
      return () => clearTimeout(timeout);
    }
  }, [typingPhraseIndex]);

  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-white max-w-2xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-4 leading-snug text-white">
        All Your Favorites — <span className="text-pink-400">{typedWord}</span>
      </h1>

      <p className="text-lg text-gray-300 max-w-xl min-h-[4rem]">
        {typingText}
      </p>

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
          <Link href="/auth/signup">Create Account</Link>
        </Button>
      </div>

      <p className="mt-8 text-sm opacity-75">It's quick, easy, and completely free!</p>
    </div>
  );
}
