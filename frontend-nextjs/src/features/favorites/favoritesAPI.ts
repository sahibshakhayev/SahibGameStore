// Create this as features/favorites/favoritesAPI.ts

import api from '../../api/axios'

// Add to favorites
export const addToFavorites = async (gameId: string): Promise<void> => {
  const res = await api.post('/api/Favorites', gameId, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return res.data
}

// Remove from favorites
export const removeFromFavorites = async (gameId: string): Promise<void> => {
  const res = await api.delete(`/api/Favorites/${gameId}`)
  return res.data
}

// Check if game is in favorites
export const checkFavoriteStatus = async (gameId: string): Promise<boolean> => {
  try {
    const res = await api.get('/api/Favorites')
    const favorites = res.data
    
    // Check if the gameId exists in the favorites array
    return favorites.some((favorite: any) => favorite.gameId === gameId || favorite.id === gameId)
  } catch (error) {
    return false
  }
}

// Get all user favorites
export const getUserFavorites = async () => {
  const res = await api.get('/api/Favorites')
  return res.data
}