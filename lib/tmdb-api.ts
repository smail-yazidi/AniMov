const API_KEY = "0ea57183666c0941bdffc1a230400037"
const BASE_URL = "https://api.themoviedb.org/3"
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p"

export interface Movie {
  id: number
  title: string
  original_title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  adult: boolean
  original_language: string
  popularity: number
}

export interface TVShow {
  id: number
  name: string
  original_name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  original_language: string
  popularity: number
}

export interface MovieDetails extends Movie {
  runtime: number
  genres: Genre[]
  production_companies: ProductionCompany[]
  production_countries: ProductionCountry[]
  spoken_languages: SpokenLanguage[]
  status: string
  tagline: string
  budget: number
  revenue: number
  imdb_id: string
}

export interface TVShowDetails extends TVShow {
  created_by: Creator[]
  episode_run_time: number[]
  genres: Genre[]
  in_production: boolean
  languages: string[]
  last_air_date: string
  networks: Network[]
  number_of_episodes: number
  number_of_seasons: number
  production_companies: ProductionCompany[]
  seasons: Season[]
  status: string
  type: string
}

export interface Genre {
  id: number
  name: string
}

export interface ProductionCompany {
  id: number
  logo_path: string | null
  name: string
  origin_country: string
}

export interface ProductionCountry {
  iso_3166_1: string
  name: string
}

export interface SpokenLanguage {
  english_name: string
  iso_639_1: string
  name: string
}

export interface Creator {
  id: number
  credit_id: string
  name: string
  gender: number
  profile_path: string | null
}
interface ReadlistItem {
  id: string
  title: string
  type: "manga" | "book"
  poster: string
  rating: number
  year: number
  addedDate: string
  status: "plan-to-read" | "reading" | "completed" | "on-hold" | "dropped"
  progress?: string
  genres: string[]
}

const mockReadlist: ReadlistItem[] = [
  {
    id: "1",
    title: "Attack on Titan",
    type: "manga",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 9.0,
    year: 2009,
    addedDate: "2024-01-20",
    status: "reading",
    progress: "Chapter 120/139",
    genres: ["Action", "Drama"],
  },
  {
    id: "2",
    title: "The Hobbit",
    type: "book",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 8.5,
    year: 1937,
    addedDate: "2024-01-18",
    status: "plan-to-read",
    genres: ["Fantasy", "Adventure"],
  },
  {
    id: "3",
    title: "One Piece",
    type: "manga",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 9.2,
    year: 1997,
    addedDate: "2024-01-15",
    status: "reading",
    progress: "Chapter 1050/1100+",
    genres: ["Adventure", "Comedy"],
  },
  {
    id: "4",
    title: "Dune",
    type: "book",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 8.8,
    year: 1965,
    addedDate: "2024-01-12",
    status: "completed",
    progress: "Finished",
    genres: ["Sci-Fi", "Adventure"],
  },
  {
    id: "5",
    title: "Chainsaw Man",
    type: "manga",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 8.9,
    year: 2018,
    addedDate: "2024-01-10",
    status: "completed",
    progress: "Chapter 97/97",
    genres: ["Action", "Horror"],
  },
  {
    id: "6",
    title: "1984",
    type: "book",
    poster: "/placeholder.svg?height=300&width=200",
    rating: 8.7,
    year: 1949,
    addedDate: "2024-01-08",
    status: "on-hold",
    progress: "Page 150/328",
    genres: ["Dystopian", "Political"],
  },
]
export interface Network {
  id: number
  logo_path: string | null
  name: string
  origin_country: string
}

export interface Season {
  air_date: string
  episode_count: number
  id: number
  name: string
  overview: string
  poster_path: string | null
  season_number: number
}

export interface Cast {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

export interface Crew {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
}

export interface Credits {
  cast: Cast[]
  crew: Crew[]
}

// Utility function to build image URLs
export const getImageUrl = (path: string | null, size = "w500"): string => {
  if (!path) return "/placeholder.svg?height=600&width=400"
  return `${IMAGE_BASE_URL}/${size}${path}`
}

// API Functions
export const tmdbApi = {
  // Search movies
  searchMovies: async (
    query: string,
    page = 1,
  ): Promise<{ results: Movie[]; total_pages: number; total_results: number }> => {
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`,
    )
    if (!response.ok) throw new Error("Failed to search movies")
    return response.json()
  },

  // Search TV shows
  searchTVShows: async (
    query: string,
    page = 1,
  ): Promise<{ results: TVShow[]; total_pages: number; total_results: number }> => {
    const response = await fetch(
      `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`,
    )
    if (!response.ok) throw new Error("Failed to search TV shows")
    return response.json()
  },

  // Get trending movies
  getTrendingMovies: async (timeWindow: "day" | "week" = "week"): Promise<{ results: Movie[] }> => {
    const response = await fetch(`${BASE_URL}/trending/movie/${timeWindow}?api_key=${API_KEY}`)
    if (!response.ok) throw new Error("Failed to get trending movies")
    return response.json()
  },

  // Get trending TV shows
  getTrendingTVShows: async (timeWindow: "day" | "week" = "week"): Promise<{ results: TVShow[] }> => {
    const response = await fetch(`${BASE_URL}/trending/tv/${timeWindow}?api_key=${API_KEY}`)
    if (!response.ok) throw new Error("Failed to get trending TV shows")
    return response.json()
  },

  // Get popular movies
  getPopularMovies: async (page = 1): Promise<{ results: Movie[]; total_pages: number }> => {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`)
    if (!response.ok) throw new Error("Failed to get popular movies")
    return response.json()
  },

  // Get popular TV shows
  getPopularTVShows: async (page = 1): Promise<{ results: TVShow[]; total_pages: number }> => {
    const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}`)
    if (!response.ok) throw new Error("Failed to get popular TV shows")
    return response.json()
  },

  // Get movie details
  getMovieDetails: async (movieId: number): Promise<MovieDetails> => {
    const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`)
    if (!response.ok) throw new Error("Failed to get movie details")
    return response.json()
  },

  // Get TV show details
  getTVShowDetails: async (tvId: number): Promise<TVShowDetails> => {
    const response = await fetch(`${BASE_URL}/tv/${tvId}?api_key=${API_KEY}`)
    if (!response.ok) throw new Error("Failed to get TV show details")
    return response.json()
  },

  // Get movie credits
  getMovieCredits: async (movieId: number): Promise<Credits> => {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`)
    if (!response.ok) throw new Error("Failed to get movie credits")
    return response.json()
  },

  // Get TV show credits
  getTVShowCredits: async (tvId: number): Promise<Credits> => {
    const response = await fetch(`${BASE_URL}/tv/${tvId}/credits?api_key=${API_KEY}`)
    if (!response.ok) throw new Error("Failed to get TV show credits")
    return response.json()
  },

  // Get similar movies
  getSimilarMovies: async (movieId: number): Promise<{ results: Movie[] }> => {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/similar?api_key=${API_KEY}`)
    if (!response.ok) throw new Error("Failed to get similar movies")
    return response.json()
  },

  // Get similar TV shows
  getSimilarTVShows: async (tvId: number): Promise<{ results: TVShow[] }> => {
    const response = await fetch(`${BASE_URL}/tv/${tvId}/similar?api_key=${API_KEY}`)
    if (!response.ok) throw new Error("Failed to get similar TV shows")
    return response.json()
  },

  // Get movie genres
  getMovieGenres: async (): Promise<{ genres: Genre[] }> => {
    const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`)
    if (!response.ok) throw new Error("Failed to get movie genres")
    return response.json()
  },

  // Get TV genres
  getTVGenres: async (): Promise<{ genres: Genre[] }> => {
    const response = await fetch(`${BASE_URL}/genre/tv/list?api_key=${API_KEY}`)
    if (!response.ok) throw new Error("Failed to get TV genres")
    return response.json()
  },

  // Discover movies with filters
  discoverMovies: async (
    params: {
      page?: number
      genre?: number
      year?: number
      sort_by?: string
    } = {},
  ): Promise<{ results: Movie[]; total_pages: number }> => {
    const searchParams = new URLSearchParams({
      api_key: API_KEY,
      page: (params.page || 1).toString(),
      ...(params.genre && { with_genres: params.genre.toString() }),
      ...(params.year && { year: params.year.toString() }),
      ...(params.sort_by && { sort_by: params.sort_by }),
    })

    const response = await fetch(`${BASE_URL}/discover/movie?${searchParams}`)
    if (!response.ok) throw new Error("Failed to discover movies")
    return response.json()
  },

  // Discover TV shows with filters
  discoverTVShows: async (
    params: {
      page?: number
      genre?: number
      year?: number
      sort_by?: string
    } = {},
  ): Promise<{ results: TVShow[]; total_pages: number }> => {
    const searchParams = new URLSearchParams({
      api_key: API_KEY,
      page: (params.page || 1).toString(),
      ...(params.genre && { with_genres: params.genre.toString() }),
      ...(params.year && { first_air_date_year: params.year.toString() }),
      ...(params.sort_by && { sort_by: params.sort_by }),
    })

    const response = await fetch(`${BASE_URL}/discover/tv?${searchParams}`)
    if (!response.ok) throw new Error("Failed to discover TV shows")
    return response.json()
  },
}
