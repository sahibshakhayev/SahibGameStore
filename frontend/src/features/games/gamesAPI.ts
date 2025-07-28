import api from '../../api/axios'
import { type PagedGames, type GameDetail, type Review } from './types'

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

export const postReview = async (review: {
  productId: string
  rating: number
  considerations: string
}) => {
  const res = await api.post('/api/Reviews', review)
  return res.data
}
