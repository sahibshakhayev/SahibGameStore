"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addToCart } from "../../features/cart/cartAPI";
import { addToFavorites, removeFromFavorites, checkFavoriteStatus } from "../../features/favorites/favoritesAPI";

interface Genre {
  id: number;
  name: string;
}

interface Platform {
  id: number;
  name: string;
}

interface Game {
  id: string;
  name: string;
  imageRelativePath?: string;
  shortDescription?: string;
  description?: string;
  genres?: Genre[];
  platforms?: Platform[];
  availableQuantity: number;
  usersScore?: number;
  price?: number;
  releaseDate: string;
}

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showCartAnimation, setShowCartAnimation] = useState(false);
  const [showFavoriteAnimation, setShowFavoriteAnimation] = useState(false);

  // Check authentication status on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      const user = localStorage.getItem('userName');
      setIsAuthenticated(!!token && !!user);
    }
  }, []);

  // Check favorite status
  const { data: isFavorite, isLoading: loadingFavorite } = useQuery<boolean>({
    queryKey: ['favorite-status', game.id.toString()],
    queryFn: () => checkFavoriteStatus(game.id.toString()),
    enabled: isAuthenticated
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: () => addToCart({ gameId: game.id.toString(), quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setShowCartAnimation(true);
      setTimeout(() => setShowCartAnimation(false), 2000);
    },
    onError: (error) => {
      console.error('Error adding to cart:', error);
    },
  });

  // Favorite mutation
  const favoriteMutation = useMutation({
    mutationFn: ({ gameId, isFavorite }: { gameId: string; isFavorite: boolean }) => 
      isFavorite ? removeFromFavorites(gameId) : addToFavorites(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-status', game.id.toString()] });
      setShowFavoriteAnimation(true);
      setTimeout(() => setShowFavoriteAnimation(false), 2000);
    },
    onError: (error) => {
      console.error('Error toggling favorite:', error);
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to game details
    e.stopPropagation();

    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pendingCartAction', JSON.stringify({
          gameId: game.id,
          quantity: 1,
          returnUrl: `/games/${game.id}`
        }));
      }
      
      router.push(`/login?from=${encodeURIComponent(`/games/${game.id}`)}&message=${encodeURIComponent('Please log in to add items to your cart.')}&pendingAction=addToCart`);
      return;
    }

    if (game.availableQuantity > 0) {
      addToCartMutation.mutate();
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to game details
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(`/login?from=${encodeURIComponent(`/games/${game.id}`)}&message=${encodeURIComponent('Please log in to manage your favorites.')}&pendingAction=addToFavorites`);
      return;
    }

    favoriteMutation.mutate({ gameId: game.id.toString(), isFavorite: isFavorite || false });
  };

  const formatPrice = (price?: number) => {
    return price ? `$${price.toFixed(2)}` : "Free";
  };

  const formatRating = (rating?: number) => {
    return rating ? rating.toFixed(1) : "N/A";
  };

  return (
    <>
      {/* Cart Animation Overlay */}
      {showCartAnimation && (
        <div className="fixed top-4 right-4 pointer-events-none z-50">
          <div className="animate-bounce">
            <div className="bg-cyan-500 text-white p-3 rounded-full shadow-lg">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-2 bg-gray-800 border border-cyan-500 rounded-lg shadow-lg p-4 animate-fade-in-up">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-cyan-400">Added to cart!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Favorite Animation Overlay */}
      {showFavoriteAnimation && (
        <div className="fixed top-4 right-20 pointer-events-none z-50">
          <div className="animate-bounce">
            <div className="bg-red-500 text-white p-3 rounded-full shadow-lg">
              <Heart className="w-6 h-6" fill="currentColor" />
            </div>
          </div>
          <div className="mt-2 bg-gray-800 border border-red-500 rounded-lg shadow-lg p-4 animate-fade-in-up">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-400">
                  {isFavorite ? 'Added to Favorites!' : 'Removed from favorites!'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Card className="bg-gray-800 border-gray-700 hover:border-cyan-400 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20 group">
        <CardContent className="p-0">
          {/* Game Image */}
          <div className="relative overflow-hidden rounded-t-lg">
            <Image
              src={ (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5159') + game.imageRelativePath || '/api/placeholder/300/200'}
              alt={game.name}
              width={300}
              height={200}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleToggleFavorite}
                disabled={loadingFavorite || favoriteMutation.isPending}
                className={`transition-all duration-300 ${
                  isFavorite 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                }`}
              >
                {favoriteMutation.isPending ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                )}
              </Button>
              
              <Button 
                size="sm" 
                className={`transition-all duration-300 ${
                  game.availableQuantity > 0
                    ? addToCartMutation.isPending
                      ? 'bg-cyan-400 text-gray-900'
                      : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
                onClick={handleAddToCart}
                disabled={game.availableQuantity === 0 || addToCartMutation.isPending}
              >
                {addToCartMutation.isPending ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <ShoppingCart className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Availability Badge */}
            {game.availableQuantity > 0 ? (
              <Badge className="absolute top-3 right-3 bg-green-600 hover:bg-green-600 text-white">
                In Stock
              </Badge>
            ) : (
              <Badge className="absolute top-3 right-3 bg-red-600 hover:bg-red-600 text-white">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Game Info */}
          <Link href={"/games/" + game.id}>
            <div className="p-4">
              <h3 className="text-white font-semibold text-lg mb-2 line-clamp-1 group-hover:text-cyan-400 transition-colors">
                {game.name}
              </h3>

              <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                {game.shortDescription || game.description}
              </p>

              {/* Genres */}
              <div className="flex flex-wrap gap-1 mb-3">
                {game.genres?.slice(0, 2).map((genre) => (
                  <Badge
                    key={genre.id}
                    variant="outline"
                    className="text-xs border-gray-600 text-gray-300"
                  >
                    {genre.name}
                  </Badge>
                ))}
              </div>

              {/* Platforms */}
              <div className="flex flex-wrap gap-1 mb-3">
                {game.platforms?.slice(0, 3).map((platform) => (
                  <Badge
                    key={platform.id}
                    variant="secondary"
                    className="text-xs bg-gray-700 text-gray-300"
                  >
                    {platform.name}
                  </Badge>
                ))}
              </div>

              {/* Rating and Price */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-gray-300 text-sm">
                    {formatRating(game.usersScore)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-cyan-400 font-bold text-lg">
                    {formatPrice(game.price)}
                  </span>
                </div>
              </div>

              {/* Release Date */}
              <div className="mt-2">
                <span className="text-gray-500 text-xs">
                  Released: {new Date(game.releaseDate).getFullYear()}
                </span>
              </div>
            </div>
          </Link>
        </CardContent>
      </Card>
    </>
  );
};

export default GameCard;