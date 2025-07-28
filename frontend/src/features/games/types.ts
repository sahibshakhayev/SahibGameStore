export interface GameSummary {
  id: string
  name: string
  releaseDate: string
  usersScore: number | null
  price: number
  availableQuantity: number
  shortDescription: string
  imageRelativePath: string
  coverImageRelativePath: string | null
}

export interface PagedGames {
  items: GameSummary[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export interface Developer { id: string; name: string; foundingdate?: string; logoPath?: string; }
export interface Genre { id: string; name: string; description?: string; }
export interface Platform { id: string; name: string; }

export interface GameDetail extends GameSummary {
  description: string
  developers: Developer[]
  genres: Genre[]
  publishers: Developer[]
  platforms: Platform[]
}

export interface Review {
  userId: string
  productId: string
  rating: number
  considerations: string
}
