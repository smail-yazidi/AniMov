// Jikan API integration for anime and manga data
const JIKAN_BASE_URL = "https://api.jikan.moe/v4"

// Rate limiting - Jikan allows 1 request per second
let lastRequestTime = 0
const RATE_LIMIT_DELAY = 1000

const rateLimit = async () => {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest))
  }
  lastRequestTime = Date.now()
}

// Anime interfaces
export interface JikanAnime {
  mal_id: number
  url: string
  images: {
    jpg: {
      image_url: string
      small_image_url: string
      large_image_url: string
    }
    webp: {
      image_url: string
      small_image_url: string
      large_image_url: string
    }
  }
  trailer: {
    youtube_id: string | null
    url: string | null
    embed_url: string | null
  }
  approved: boolean
  titles: Array<{
    type: string
    title: string
  }>
  title: string
  title_english: string | null
  title_japanese: string | null
  title_synonyms: string[]
  type: string
  source: string
  episodes: number | null
  status: string
  airing: boolean
  aired: {
    from: string | null
    to: string | null
    prop: {
      from: {
        day: number | null
        month: number | null
        year: number | null
      }
      to: {
        day: number | null
        month: number | null
        year: number | null
      }
    }
    string: string
  }
  duration: string
  rating: string
  score: number | null
  scored_by: number | null
  rank: number | null
  popularity: number
  members: number
  favorites: number
  synopsis: string | null
  background: string | null
  season: string | null
  year: number | null
  broadcast: {
    day: string | null
    time: string | null
    timezone: string | null
    string: string | null
  }
  producers: Array<{
    mal_id: number
    type: string
    name: string
    url: string
  }>
  licensors: Array<{
    mal_id: number
    type: string
    name: string
    url: string
  }>
  studios: Array<{
    mal_id: number
    type: string
    name: string
    url: string
  }>
  genres: Array<{
    mal_id: number
    type: string
    name: string
    url: string
  }>
  explicit_genres: Array<{
    mal_id: number
    type: string
    name: string
    url: string
  }>
  themes: Array<{
    mal_id: number
    type: string
    name: string
    url: string
  }>
  demographics: Array<{
    mal_id: number
    type: string
    name: string
    url: string
  }>
}

// Manga interfaces
export interface JikanManga {
  mal_id: number
  url: string
  images: {
    jpg: {
      image_url: string
      small_image_url: string
      large_image_url: string
    }
    webp: {
      image_url: string
      small_image_url: string
      large_image_url: string
    }
  }
  approved: boolean
  titles: Array<{
    type: string
    title: string
  }>
  title: string
  title_english: string | null
  title_japanese: string | null
  title_synonyms: string[]
  type: string
  chapters: number | null
  volumes: number | null
  status: string
  publishing: boolean
  published: {
    from: string | null
    to: string | null
    prop: {
      from: {
        day: number | null
        month: number | null
        year: number | null
      }
      to: {
        day: number | null
        month: number | null
        year: number | null
      }
    }
    string: string
  }
  score: number | null
  scored_by: number | null
  rank: number | null
  popularity: number
  members: number
  favorites: number
  synopsis: string | null
  background: string | null
  authors: Array<{
    mal_id: number
    type: string
    name: string
    url: string
  }>
  serializations: Array<{
    mal_id: number
    type: string
    name: string
    url: string
  }>
  genres: Array<{
    mal_id: number
    type: string
    name: string
    url: string
  }>
  explicit_genres: Array<{
    mal_id: number
    type: string
    name: string
    url: string
  }>
  themes: Array<{
    mal_id: number
    type: string
    name: string
    url: string
  }>
  demographics: Array<{
    mal_id: number
    type: string
    name: string
    url: string
  }>
}

// Character interface
export interface JikanCharacter {
  mal_id: number
  url: string
  images: {
    jpg: {
      image_url: string
    }
    webp: {
      image_url: string
      small_image_url: string
    }
  }
  name: string
  name_kanji: string | null
  nicknames: string[]
  favorites: number
  about: string | null
}

// API Response interfaces
export interface JikanResponse<T> {
  data: T[]
  pagination: {
    last_visible_page: number
    has_next_page: boolean
    current_page: number
    items: {
      count: number
      total: number
      per_page: number
    }
  }
}

export interface JikanSingleResponse<T> {
  data: T
}

// Search parameters
export interface AnimeSearchParams {
  type?: string
  status?: string
  rating?: string
  genre?: string
  order_by?: string
  sort?: "desc" | "asc"
  limit?: number
}

export interface MangaSearchParams {
  type?: string
  status?: string
  genre?: string
  order_by?: string
  sort?: "desc" | "asc"
  limit?: number
}

class JikanAPI {
  private async makeRequest<T>(endpoint: string): Promise<T> {
    await rateLimit()

    try {
      const response = await fetch(`${JIKAN_BASE_URL}${endpoint}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Jikan API request failed:", error)
      throw error
    }
  }

  // Anime methods
  async getTopAnime(page = 1, type?: string): Promise<JikanResponse<JikanAnime>> {
    let endpoint = `/top/anime?page=${page}&limit=25`
    if (type) {
      endpoint += `&type=${type}`
    }
    return this.makeRequest<JikanResponse<JikanAnime>>(endpoint)
  }

  async searchAnime(query: string, page = 1, params?: AnimeSearchParams): Promise<JikanResponse<JikanAnime>> {
    let endpoint = `/anime?q=${encodeURIComponent(query)}&page=${page}&limit=25`

    if (params) {
      if (params.type) endpoint += `&type=${params.type}`
      if (params.status) endpoint += `&status=${params.status}`
      if (params.rating) endpoint += `&rating=${params.rating}`
      if (params.genre) endpoint += `&genres=${params.genre}`
      if (params.order_by) endpoint += `&order_by=${params.order_by}`
      if (params.sort) endpoint += `&sort=${params.sort}`
    }

    return this.makeRequest<JikanResponse<JikanAnime>>(endpoint)
  }

  async getAnimeById(id: number): Promise<JikanSingleResponse<JikanAnime>> {
    return this.makeRequest<JikanSingleResponse<JikanAnime>>(`/anime/${id}`)
  }

  async getAnimeCharacters(id: number): Promise<JikanResponse<JikanCharacter>> {
    return this.makeRequest<JikanResponse<JikanCharacter>>(`/anime/${id}/characters`)
  }

  async getAnimeRecommendations(id: number): Promise<JikanResponse<{ entry: JikanAnime }>> {
    return this.makeRequest<JikanResponse<{ entry: JikanAnime }>>(`/anime/${id}/recommendations`)
  }

 
  async getTopManga(page = 1, type?: string): Promise<JikanResponse<JikanManga>> {
    let endpoint = `/top/manga?page=${page}&limit=25`
    if (type) {
      endpoint += `&type=${type}`
    }
    return this.makeRequest<JikanResponse<JikanManga>>(endpoint)
  }

  async searchManga(query: string, page = 1, params?: MangaSearchParams): Promise<JikanResponse<JikanManga>> {
    let endpoint = `/manga?q=${encodeURIComponent(query)}&page=${page}&limit=25`

    if (params) {
      if (params.type) endpoint += `&type=${params.type}`
      if (params.status) endpoint += `&status=${params.status}`
      if (params.genre) endpoint += `&genres=${params.genre}`
      if (params.order_by) endpoint += `&order_by=${params.order_by}`
      if (params.sort) endpoint += `&sort=${params.sort}`
    }

    return this.makeRequest<JikanResponse<JikanManga>>(endpoint)
  }

  async getMangaById(id: number): Promise<JikanSingleResponse<JikanManga>> {
    return this.makeRequest<JikanSingleResponse<JikanManga>>(`/manga/${id}`)
  }

  async getMangaCharacters(id: number): Promise<JikanResponse<JikanCharacter>> {
    return this.makeRequest<JikanResponse<JikanCharacter>>(`/manga/${id}/characters`)
  }

  async getMangaRecommendations(id: number): Promise<JikanResponse<{ entry: JikanManga }>> {
    return this.makeRequest<JikanResponse<{ entry: JikanManga }>>(`/manga/${id}/recommendations`)
  }
}

export const jikanApi = new JikanAPI()
