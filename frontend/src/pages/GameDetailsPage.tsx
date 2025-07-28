import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchGameById, fetchReviewsForGame } from '../features/games/gamesAPI'
import { type GameDetail, type Review } from '../features/games/types'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postReview } from '../features/games/gamesAPI'
import { useState, useRef } from 'react'
import { addToCart } from '../features/cart/cartAPI'

const GameDetailsPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const queryClient = useQueryClient()
  const [rating, setRating] = useState<number>(5)
  const [considerations, setConsiderations] = useState('')
  const [formError, setFormError] = useState('')
  const [showCartAnimation, setShowCartAnimation] = useState(false)
  const addToCartButtonRef = useRef<HTMLButtonElement>(null)
  
  const accessToken = localStorage.getItem('accessToken')
  const userName = localStorage.getItem('userName')
  const isAuthenticated = !!accessToken && !!userName

  const reviewMutation = useMutation({
    mutationFn: postReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] })
      setConsiderations('')
      setRating(5)
    },
    onError: () => {
      setFormError('Failed to submit review.')
    },
  })

  const { data: game, isLoading: loadingGame } = useQuery<GameDetail>({
    queryKey: ['game', id],
    queryFn: () => fetchGameById(id!),
    enabled: !!id
  })
  
  const addMutation = useMutation({
    mutationFn: () => {
      if (!game) throw new Error('Game not found')
      return addToCart({ gameId: game.id, quantity: 1 })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      // Trigger cart animation
      setShowCartAnimation(true)
      setTimeout(() => setShowCartAnimation(false), 2000)
    },
  })
  
  const { data: reviews, isLoading: loadingReviews } = useQuery<Review[]>({
    queryKey: ['reviews', id],
    queryFn: () => fetchReviewsForGame(id!),
    enabled: !!id
  })

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      sessionStorage.setItem('pendingCartAction', JSON.stringify({
        gameId: game?.id,
        quantity: 1,
        returnUrl: `/games/${id}`
      }))
      
      navigate('/login', { 
        state: { 
          from: `/games/${id}`,
          message: 'Please log in to add items to your cart.',
          pendingAction: 'addToCart'
        }
      })
      return
    }

    addMutation.mutate()
  }

  if (loadingGame) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Game not found</h1>
          <Link 
            to="/games" 
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Games
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cart Animation Overlay */}
      {showCartAnimation && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute top-4 right-4">
            {/* Flying cart icon animation */}
            <div className="animate-bounce">
              <div className="bg-green-500 text-white p-3 rounded-full shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6H19" />
                </svg>
              </div>
            </div>
            {/* Success message */}
            <div className="mt-2 bg-white border border-green-200 rounded-lg shadow-lg p-4 animate-fade-in-up">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">Added to cart!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link 
            to="/games" 
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Games
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Game Image */}
          <div className="space-y-4">
            {game.coverImageRelativePath ? (
              <img 
                src={import.meta.env.VITE_API_BASE_URL + game.coverImageRelativePath} 
                alt={game.name} 
                className="w-full h-96 object-cover rounded-xl shadow-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-xl flex items-center justify-center">
                <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Game Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{game.name}</h1>
              <p className="text-lg text-gray-600 leading-relaxed">{game.description}</p>
            </div>

            {/* Price and Stock */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-gray-900">${game.price.toFixed(2)}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  game.availableQuantity > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {game.availableQuantity > 0 
                    ? `${game.availableQuantity} in stock` 
                    : 'Out of stock'
                  }
                </span>
              </div>
              
              <button
                ref={addToCartButtonRef}
                disabled={game.availableQuantity === 0 || addMutation.isPending}
                onClick={handleAddToCart}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform relative overflow-hidden ${
                  game.availableQuantity > 0
                    ? isAuthenticated 
                      ? addMutation.isPending
                        ? 'bg-blue-400 text-white scale-95'
                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 active:scale-95'
                      : 'bg-green-600 text-white hover:bg-green-700 hover:scale-105 active:scale-95'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {/* Button content with icons */}
                <span className="flex items-center justify-center">
                  {addMutation.isPending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding to Cart...
                    </>
                  ) : game.availableQuantity > 0 ? (
                    isAuthenticated ? (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6H19" />
                        </svg>
                        Add to Cart
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Sign In to Add to Cart
                      </>
                    )
                  ) : (
                    'Out of Stock'
                  )}
                </span>

                {/* Success ripple effect */}
                {addMutation.isSuccess && (
                  <span className="absolute inset-0 bg-green-400 opacity-30 animate-ping rounded-lg"></span>
                )}
              </button>
            </div>

            {/* Game Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-3">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {game.genres?.map((genre) => (
                    <span 
                      key={genre.id} 
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-3">Platforms</h3>
                <div className="flex flex-wrap gap-2">
                  {game.platforms?.map((platform) => (
                    <span 
                      key={platform.id} 
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                    >
                      {platform.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* User Score */}
            {game.usersScore && (
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-2">User Score</h3>
                <div className="flex items-center">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(game.usersScore!) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-2 text-gray-600 font-medium">
                      {game.usersScore.toFixed(1)} / 5.0
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>
          
          {loadingReviews ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : reviews && reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review, i) => (
                <div key={i} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, starIndex) => (
                        <svg
                          key={starIndex}
                          className={`h-5 w-5 ${
                            starIndex < review.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-2 font-semibold text-gray-900">
                        {review.rating} / 5
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.considerations}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-500">Be the first to review this game!</p>
            </div>
          )}

          {isAuthenticated ? (
            <div className="mt-10 bg-white p-8 rounded-xl shadow-sm border">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Add Your Review</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!rating || !considerations.trim()) {
                    setFormError('All fields are required.')
                    return
                  }
                  setFormError('')
                  reviewMutation.mutate({ productId: id!, rating, considerations })
                }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5].map((r) => (
                      <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Review</label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    rows={5}
                    value={considerations}
                    onChange={(e) => setConsiderations(e.target.value)}
                    placeholder="Share your thoughts about this game..."
                  />
                </div>

                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm font-medium">{formError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                  disabled={reviewMutation.isPending}
                >
                  {reviewMutation.isPending ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting Review...
                    </span>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="mt-10 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl border border-blue-200">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Join the Conversation!</h3>
                <p className="text-gray-600 mb-6">Sign in to share your thoughts and help other gamers discover great games.</p>
                <Link 
                  to="/login" 
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Sign In to Review
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GameDetailsPage