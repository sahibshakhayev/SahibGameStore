'use client'

import React, { useState, useEffect } from 'react'
import { Heart, ShoppingCart, Trash2, Grid3X3, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/use-toast'
import { getUserFavorites, removeFromFavorites } from '@/features/favorites/favoritesAPI'

interface Platform {
  id: string
  name: string
}

interface Genre {
  id: string
  name: string
}

interface Game {
  gameId: string
  name: string
  description: string
  shortDescription?: string
  price: number
  userScore: number
  releaseDate: string
  coverImageUrl?: string
  availableQuantity: number
  platforms?: Platform[]
  genres?: Genre[]
}

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')







  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      setLoading(true)
      const data = await getUserFavorites()
      setFavorites(data)
    } catch (error) {
      console.error('Failed to load favorites:', error)
      toast({
        title: "Error",
        description: "Failed to load your favorites",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromFavorites = async (gameId: string) => {
    try {

        console.log(gameId);
      await removeFromFavorites(gameId)
      setFavorites(prev => prev.filter(game => game.gameId !== gameId))
      toast({
        title: "Removed from Favorites",
        description: "Game has been removed from your favorites"
      })
    } catch (error) {
      console.error('Failed to remove from favorites:', error)
      toast({
        title: "Error",
        description: "Failed to remove game from favorites",
        variant: "destructive"
      })
    }
  }

  const addToCart = (game: Game) => {
    // This would integrate with your cart API
    toast({
      title: "Added to Cart",
      description: `${game.name} has been added to your cart`
    })
  }

  const formatPrice = (price: number) => {
    return price ? `$${price.toFixed(2)}` : 'Free'
  }

  console.log(favorites)

  const formatRating = (rating: number) => {
    return rating ? rating.toFixed(1) : 'N/A'
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 bg-gray-700 mb-2" />
            <Skeleton className="h-4 w-32 bg-gray-700" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full bg-gray-700" />
                <Skeleton className="h-4 w-3/4 bg-gray-700" />
                <Skeleton className="h-4 w-1/2 bg-gray-700" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-8 bg-gray-800 rounded-lg border border-gray-700">
            <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Favorites Yet</h2>
            <p className="text-gray-400 mb-6">
              Start exploring games and add them to your favorites to see them here!
            </p>
            <Button 
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3"
              onClick={() => window.location.href = '/games'}
            >
              <Grid3X3 className="mr-2 h-5 w-5" />
              Browse Games
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Your Favorites</h1>
              <p className="text-gray-400">{favorites.length} game{favorites.length > 1 ? 's' : ''} in your favorites</p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 bg-gray-800 p-1 rounded-lg border border-gray-700">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' 
                  ? 'bg-cyan-600 hover:bg-cyan-700 text-white' 
                  : 'text-gray-300 hover:text-cyan-400 hover:bg-gray-700'
                }
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' 
                  ? 'bg-cyan-600 hover:bg-cyan-700 text-white' 
                  : 'text-gray-300 hover:text-cyan-400 hover:bg-gray-700'
                }
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {
            
            favorites.map((game) =>  (
            
              <Card key={game.gameId} className="bg-gray-800 border-gray-700 hover:border-cyan-400 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20 group">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5159') + game.coverImageUrl || '/api/placeholder/300/200'}
                      alt={game.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => addToCart(game)}
                        disabled={game.availableQuantity === 0}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-50"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleRemoveFromFavorites(game.gameId)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-white font-semibold text-lg mb-2 line-clamp-1 group-hover:text-cyan-400 transition-colors">
                      {game.name}
                    </h3>
                    
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {game.shortDescription || game.description}
                    </p>

            

                    

                    
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        

        {/* List View */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {favorites.map((game) => (
              <Card key={game.gameId} className="bg-gray-800 border-gray-700 hover:border-cyan-400 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        src={(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5159') + game.coverImageUrl || '/api/placeholder/300/200'}
                        alt={game.name}
                        className="w-32 h-20 object-cover rounded-lg"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2 hover:text-cyan-400 transition-colors">
                            {game.name}
                          </h3>
                        </div>

                        <div className="text-right ml-4">
                          
                          <div className="flex flex-col space-y-2">
                            <Button
                              size="sm"
                              onClick={() => addToCart(game)}
                              disabled={game.availableQuantity === 0}
                              className="bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-50"
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Add to Cart
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveFromFavorites(game.gameId)}
                              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default FavoritesPage