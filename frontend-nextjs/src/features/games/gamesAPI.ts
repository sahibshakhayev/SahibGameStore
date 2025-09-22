import api from '../../api/axios'
import { type PagedGames, type GameDetail, type Review, type GameSummary, type GameOverview } from './types'

interface QueryParams {
  pageNumber?: number
  pageSize?: number
  searchTerm?: string
  sortBy?: string
  isDescending?: boolean
  genreId?: string
  developerId?: string
  platformId?: string
}



export const fetchGames = async (params: QueryParams): Promise<PagedGames> => {
  const res = await api.get<PagedGames>('/api/Games', { params })
  return res.data
}

export const fetchGameById = async (id: string): Promise<GameDetail> => {
  const res = await api.get<GameDetail>(`/api/Games/${id}`)
  return res.data
}

export const fetchReviewsForGame = async (id: string): Promise<Review[]> => {
  const res = await api.get<Review[]>(`/api/Reviews/product/${id}`)
  return res.data
}

export const fetchBestSellers = async (): Promise<GameSummary[]> => {
  const res = await api.get<GameSummary[]>('/api/Games/bestsellers');
  return res.data;
}

export const fetchBestRated = async (): Promise<GameSummary[]> => {
  const res = await api.get<GameSummary[]>('/api/Games/bestrated');
  return res.data;
}


// Add these functions to your existing gamesAPI.ts file

// Game Overview API function
export const fetchGameOverview = async (gameId: string): Promise<GameOverview> => {
  const response = await api.get<GameOverview>(`/api/Games/${gameId}/overview`);

  
  return response.data;
}


export const postReview = async (review: {
  productId: string
  rating: number
  considerations: string
}) => {
  const res = await api.post('/api/Reviews', review)
  return res.data
}
