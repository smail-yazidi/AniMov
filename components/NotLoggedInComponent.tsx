// components/NotLoggedInComponent.tsx
"use client";

import Link from "next/link";
import { Lock, LogIn, Heart, Clock, BookOpen, Star, Share2 } from "lucide-react"; // Added Share2 for sharing
import { Button } from "@/components/ui/button"; // Assuming your Button component path
import { useState, useEffect } from "react"; // Import useState and useEffect

interface NotLoggedInComponentProps {
  redirectPath?: string;
}

export default function NotLoggedInComponent({
  redirectPath = "/auth/signin",
}: NotLoggedInComponentProps) {
  const contentTypes = ['Movies', 'TV Series', 'Anime', 'Manga', 'Books'];
  const listTypes = ['playlists', 'watchlists', 'readlists', 'favorites'];

  const [currentContentTypeIndex, setCurrentContentTypeIndex] = useState(0);
  const [currentListTypeIndex, setCurrentListTypeIndex] = useState(0);
  const [isContentTypeFading, setIsContentTypeFading] = useState(false);
  const [isListTypeFading, setIsListTypeFading] = useState(false);

  useEffect(() => {
    // Animation for Content Types
    const contentInterval = setInterval(() => {
      setIsContentTypeFading(true); // Start fade-out
      setTimeout(() => {
        setCurrentContentTypeIndex(prevIndex => (prevIndex + 1) % contentTypes.length);
        setIsContentTypeFading(false); // Start fade-in after text change
      }, 700); // Duration of fade-out before content changes
    }, 3500); // Total cycle time for content type

    // Animation for List Types (staggered delay)
    const listInterval = setInterval(() => {
      setIsListTypeFading(true); // Start fade-out
      setTimeout(() => {
        setCurrentListTypeIndex(prevIndex => (prevIndex + 1) % listTypes.length);
        setIsListTypeFading(false); // Start fade-in after text change
      }, 700); // Duration of fade-out before content changes
    }, 4500); // Total cycle time for list type

    return () => {
      clearInterval(contentInterval);
      clearInterval(listInterval);
    };
  }, []); // Run once on mount

  const currentContentType = contentTypes[currentContentTypeIndex];
  const currentListType = listTypes[currentListTypeIndex];

  return (
    <div className="relative min-h-screen flex items-center justify-center text-white overflow-hidden">
      {/* Background Image/Video - Replace with your actual asset */}
      <div className="absolute inset-0 z-0">
        {/*
          Choose ONE:
          1. Static Image: Optimized for performance. Place your image in public/images/hero-bg.jpg
          2. Looping Video: More dynamic but ensure it's short, muted, and optimized for web. Place in public/videos/discovery-loop.mp4
        */}
        <img
          src="/images/hero-bg.jpg" // <-- YOUR IMAGE PATH HERE (e.g., a collage of different media)
          alt="Discover Movies, TV, Anime, Manga, Books"
          className="w-full h-full object-cover opacity-30" // Adjust opacity as needed
        />
        {/*
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-20"
        >
          <source src="/videos/discovery-loop.mp4" type="video/mp4" /> // <-- YOUR VIDEO PATH HERE
          Your browser does not support the video tag.
        </video>
        */}
        <div className="absolute inset-0 bg-black/70"></div> {/* Dark overlay for readability */}
      </div>

      {/* Content Layer */}
      <div className="relative z-10 text-center bg-black/40 backdrop-blur-sm p-8 md:p-12 rounded-lg shadow-2xl max-w-3xl w-full border border-white/20">
        <div className="flex justify-center mb-6 gap-4 text-purple-400">
          <Heart className="h-10 w-10 md:h-12 md:w-12" />
          <Clock className="h-10 w-10 md:h-12 md:w-12" />
          <BookOpen className="h-10 w-10 md:h-12 md:w-12" />
          <Star className="h-10 w-10 md:h-12 md:w-12" />
          <Share2 className="h-10 w-10 md:h-12 md:w-12" /> {/* Added share icon */}
        </div>

        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          Movies, TV Series, Anime, Manga, and Books
          <br />
          Everything you need in one place!
        </h2>

        <p className="text-gray-200 text-lg md:text-xl mb-6 max-w-prose mx-auto">
          Create your{" "}
          <span
            className={`font-bold text-yellow-300 transition-opacity duration-700 ease-in-out ${
              isListTypeFading ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {currentListType}
          </span>{" "}
          and start rating your favorite{" "}
          <span
            className={`font-bold text-cyan-300 transition-opacity duration-700 ease-in-out ${
              isContentTypeFading ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {currentContentType}
          </span>
          . Share your journey with friends and discover new content together!
        </p>

        <Link href={redirectPath} passHref>
          <Button
            size="lg"
            className="bg-purple-700 hover:bg-purple-800 text-white text-lg px-8 py-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black"
          >
            <LogIn className="h-6 w-6 mr-3" />
            Create Account to Start
          </Button>
        </Link>

        <div className="mt-8 text-gray-400 text-sm">
          <p>Already have an account? <Link href={redirectPath} className="text-purple-400 hover:underline">Log in</Link> instead.</p>
        </div>
      </div>
    </div>
  );
}