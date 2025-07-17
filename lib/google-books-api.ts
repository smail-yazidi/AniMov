// Google Books API integration
const GOOGLE_BOOKS_BASE_URL = "https://www.googleapis.com/books/v1"
const API_KEY = "AIzaSyBA_Fk0Y5Snyb8DsgE7RDOazX0gg7kfIW4"

// Book interfaces
export interface GoogleBook {
  kind: string
  id: string
  etag: string
  selfLink: string
  volumeInfo: {
    title: string
    subtitle?: string
    authors?: string[]
    publisher?: string
    publishedDate?: string
    description?: string
    industryIdentifiers?: Array<{
      type: string
      identifier: string
    }>
    readingModes: {
      text: boolean
      image: boolean
    }
    pageCount?: number
    printType: string
    categories?: string[]
    averageRating?: number
    ratingsCount?: number
    maturityRating: string
    allowAnonLogging: boolean
    contentVersion: string
    panelizationSummary?: {
      containsEpubBubbles: boolean
      containsImageBubbles: boolean
    }
    imageLinks?: {
      smallThumbnail?: string
      thumbnail?: string
      small?: string
      medium?: string
      large?: string
      extraLarge?: string
    }
    language: string
    previewLink: string
    infoLink: string
    canonicalVolumeLink: string
  }
  saleInfo: {
    country: string
    saleability: string
    isEbook: boolean
    listPrice?: {
      amount: number
      currencyCode: string
    }
    retailPrice?: {
      amount: number
      currencyCode: string
    }
    buyLink?: string
    offers?: Array<{
      finskyOfferType: number
      listPrice: {
        amountInMicros: number
        currencyCode: string
      }
      retailPrice: {
        amountInMicros: number
        currencyCode: string
      }
    }>
  }
  accessInfo: {
    country: string
    viewability: string
    embeddable: boolean
    publicDomain: boolean
    textToSpeechPermission: string
    epub: {
      isAvailable: boolean
      acsTokenLink?: string
    }
    pdf: {
      isAvailable: boolean
      acsTokenLink?: string
    }
    webReaderLink: string
    accessViewStatus: string
    quoteSharingAllowed: boolean
  }
  searchInfo?: {
    textSnippet: string
  }
}

export interface GoogleBooksResponse {
  kind: string
  totalItems: number
  items?: GoogleBook[]
}

// Search parameters
export interface BookSearchParams {
  langRestrict?: string
  orderBy?: "newest" | "relevance"
  printType?: "all" | "books" | "magazines"
  projection?: "full" | "lite"
}

class GoogleBooksAPI {
  private async makeRequest<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${GOOGLE_BOOKS_BASE_URL}${endpoint}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Google Books API request failed:", error)
      throw error
    }
  }

  async searchBooks(
    query: string,
    startIndex = 0,
    maxResults = 20,
    params?: BookSearchParams,
  ): Promise<GoogleBooksResponse> {
    let endpoint = `/volumes?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${maxResults}&key=${API_KEY}`

    if (params) {
      if (params.langRestrict) endpoint += `&langRestrict=${params.langRestrict}`
      if (params.orderBy) endpoint += `&orderBy=${params.orderBy}`
      if (params.printType) endpoint += `&printType=${params.printType}`
      if (params.projection) endpoint += `&projection=${params.projection}`
    }

    return this.makeRequest<GoogleBooksResponse>(endpoint)
  }

  async getBookById(id: string): Promise<GoogleBook> {
    return this.makeRequest<GoogleBook>(`/volumes/${id}?key=${API_KEY}`)
  }

  async getBooksByCategory(category: string, startIndex = 0, maxResults = 20): Promise<GoogleBooksResponse> {
    const query = `subject:${category}`
    return this.searchBooks(query, startIndex, maxResults, { orderBy: "relevance" })
  }

  async getPopularBooks(startIndex = 0, maxResults = 20): Promise<GoogleBooksResponse> {
    // Search for popular/bestselling books
    const queries = ["bestseller", "popular fiction", "award winning books", "classic literature"]

    const randomQuery = queries[Math.floor(Math.random() * queries.length)]
    return this.searchBooks(randomQuery, startIndex, maxResults, { orderBy: "relevance" })
  }

  async getBooksByAuthor(author: string, startIndex = 0, maxResults = 20): Promise<GoogleBooksResponse> {
    const query = `inauthor:${author}`
    return this.searchBooks(query, startIndex, maxResults, { orderBy: "relevance" })
  }
}

// Utility functions
export const getBookImageUrl = (book: GoogleBook): string | null => {
  const images = book.volumeInfo.imageLinks
  if (!images) return null

  return images.large || images.medium || images.small || images.thumbnail || images.smallThumbnail || null
}

export const getBookAuthors = (book: GoogleBook): string => {
  if (!book.volumeInfo.authors || book.volumeInfo.authors.length === 0) {
    return "Unknown Author"
  }

  if (book.volumeInfo.authors.length === 1) {
    return book.volumeInfo.authors[0]
  }

  if (book.volumeInfo.authors.length === 2) {
    return book.volumeInfo.authors.join(" & ")
  }

  return `${book.volumeInfo.authors[0]} et al.`
}

export const getBookPublishYear = (book: GoogleBook): string => {
  if (!book.volumeInfo.publishedDate) return "Unknown"

  const year = book.volumeInfo.publishedDate.split("-")[0]
  return year || "Unknown"
}

export const getBookRating = (book: GoogleBook): number => {
  return book.volumeInfo.averageRating || 0
}

export const getBookDescription = (book: GoogleBook): string => {
  return book.volumeInfo.description || book.searchInfo?.textSnippet || "No description available."
}

export const googleBooksApi = new GoogleBooksAPI()
