// src/pages/customer/GameDetailPage.tsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AxiosError } from 'axios'; // Import AxiosError

// --- Corrected Hook Names and Helpers ---
import {
  useGetApiGamesId,
  useGetApiReviewsProductId,
  usePostApiReviews,
  getGetApiGamesIdQueryKey,
  getGetApiReviewsProductIdQueryKey,
  getApiGamesId,       // For Awaited<ReturnType>
  getApiReviewsProductId, // For Awaited<ReturnType>
  postApiReviews,       // For Awaited<ReturnType>
} from '../../lib/api/endpoints';
// --- END Corrected Hook Names ---

import { addToCart } from '../../features/cart/cartSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import type { AddOrUpdateReviewDTO, ReviewListViewModel, GameViewModel} from '../../types/api.ts';
// --- Updated: Import DetailedGameViewModel and UserClaims from custom.d.ts ---
import type { UserClaims } from '../../types/custom';

import { useAuth } from '../../features/auth/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

const GameDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth(); // User is now imported from custom.d.ts and used in useAuth

  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Helper to safely extract error message
  const getErrorMessage = (error: AxiosError | Error | null | undefined): string => {
    if (!error) return 'An unknown error occurred.';

    if (error instanceof AxiosError) {
      if (error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
        return (error.response.data as { message: string }).message;
      }
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  };

  // Fetch game details - Using DetailedGameViewModel now
  const { data: game, isLoading, isError, error: gameDetailsError } = useGetApiGamesId<GameViewModel, AxiosError>(
    id!, // Pass ID as the first argument
    { // Options as the second argument
      query: { // 'query' property expected by Orval's generated hook
        enabled: !!id, // Only fetch if ID is available
      }
    }
  );

  // Fetch reviews
  const { data: reviews, isLoading: loadingReviews, isError: errorReviews, error: reviewsError } = useGetApiReviewsProductId<ReviewListViewModel[], AxiosError>(
    id!, // Pass ID as the first argument
    { // Options as the second argument
      query: { // 'query' property expected by Orval's generated hook
        enabled: !!id, // Only fetch if ID is available
      }
    }
  );


  // Add review mutation
  const addReviewMutation = usePostApiReviews<AxiosError, unknown>({ // Corrected generic types: <TError, TContext>
    mutation: {
      onSuccess: (data: Awaited<ReturnType<typeof postApiReviews>>) => { // data is likely void from API spec
        setReviewText('');
        setRating(0);
        setShowReviewForm(false);
        // Invalidate queries to refetch fresh data
        queryClient.invalidateQueries({ queryKey: getGetApiReviewsProductIdQueryKey(id!) });
        queryClient.invalidateQueries({ queryKey: getGetApiGamesIdQueryKey(id!) });
        alert('Review added successfully!');
      },
      onError: (err: AxiosError) => { // Explicitly type 'err'
        console.error('Failed to add review:', err);
        alert(`Failed to add review: ${getErrorMessage(err)}`);
      },
    },
  });

  const handleAddToCart = () => {
    // Check if game exists and has availableQuantity before dispatching
    if (game && game.availableQuantity !== undefined) {
      // Note: addToCart expects GameListViewModel, which has availableQuantity.
      // DetailedGameViewModel extends GameViewModel which can be used here.
      dispatch(addToCart(game));
      alert(`${game.name} added to cart!`);
    } else {
        alert("Cannot add to cart: game data incomplete or quantity unknown.");
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !id) {
      alert('You must be logged in to submit a review.');
      return;
    }
    const newReview: AddOrUpdateReviewDTO = {
      productId: id,
      userId: user.id,
      rating: rating,
      review: reviewText,
    };
    addReviewMutation.mutate({ data: newReview }); // Wrap in { data: ... }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <AlertMessage type="error" message={`Error loading game details: ${getErrorMessage(gameDetailsError as AxiosError | Error | null)}`} />;
  if (!game) return <AlertMessage type="info" message="Game not found." />;

  return (
    <div className="p-4 bg-white shadow-md rounded-lg text-gray-800">
      <div className="md:flex md:space-x-8">
        {/* Game Info Section */}
        <div className="md:w-1/3">
          {game.coverImageRelativePath && (
            <img
              src={"http://localhost:5159"+ game.coverImageRelativePath}
              alt={game.name || 'Game Cover'}
              className="w-full h-auto rounded-lg shadow-md mb-4 object-cover"
            />
          )}
          {!game.coverImageRelativePath && game.imageRelativePath && (
            <img
              src={"http://localhost:5159" + game.imageRelativePath}
              alt={game.name || 'Game Thumbnail'}
              className="w-full h-48 object-cover"
            />
          )}
          <h1 className="text-4xl font-bold mb-2">{game.name}</h1>
          <p className="text-xl text-blue-600 font-semibold mb-4">${game.price?.toFixed(2)}</p>
          <p className="text-gray-600 mb-2">Released: {new Date(game.releaseDate || '').toLocaleDateString()}</p>
          <p className="text-gray-600 mb-2">User Score: {game.userScore?.toFixed(1)} / 5</p>
          {/* Use optional chaining for availableQuantity as it's from custom type */}
          <p className="text-gray-600 mb-2">Available Quantity: {game.availableQuantity ?? 'N/A'}</p>
          <button
            onClick={handleAddToCart}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            disabled={game.availableQuantity === 0 || game.availableQuantity === undefined} // Disable if 0 or undefined
          >
            {game.availableQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>

        {/* Game Description and Details */}
        <div className="md:w-2/3 mt-6 md:mt-0">
          <h2 className="text-2xl font-semibold mb-3">Description</h2>
          <p className="text-gray-700 mb-4">{game.description}</p>

          <h3 className="text-xl font-semibold mb-2">Short Description</h3>
          <p className="text-gray-700 mb-4">{game.shortDescription}</p>

          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Developers:</h3>
            <p className="text-gray-700">
              {/* --- FIX: Safely access nested properties and filter out undefined/null results --- */}
              {game.developers?.map((dev: any) => dev.developer?.name).filter(Boolean).join(', ') || 'N/A'}
            </p>
          </div>

          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Publishers:</h3>
            <p className="text-gray-700">
              {/* --- FIX: Safely access nested properties and filter out undefined/null results --- */}
              {game.publishers?.map((pub: any) => pub.publisher?.name).filter(Boolean).join(', ') || 'N/A'}
            </p>
          </div>

          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Genres:</h3>
            <p className="text-gray-700">
              {/* --- FIX: Safely access nested properties and filter out undefined/null results --- */}
              {game.genres?.map((genre: any) => genre.genre?.name).filter(Boolean).join(', ') || 'N/A'}
            </p>
          </div>

          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Platforms:</h3>
            <p className="text-gray-700">
              {/* --- FIX: Safely access nested properties and filter out undefined/null results --- */}
              {game.platforms?.map((platform: any) => platform.platform?.name).filter(Boolean).join(', ') || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <hr className="my-8 border-gray-300" />

      {/* Reviews Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Customer Reviews</h2>
        {isAuthenticated && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded mb-4"
          >
            {showReviewForm ? 'Hide Review Form' : 'Add Your Review'}
          </button>
        )}

        {showReviewForm && isAuthenticated && (
          <form onSubmit={handleReviewSubmit} className="bg-gray-100 p-4 rounded-md mb-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-3">Submit a Review</h3>
            <div className="mb-4">
              <label htmlFor="rating" className="block text-gray-700 text-sm font-bold mb-2">Rating (0-5):</label>
              <input
                type="number"
                id="rating"
                min="0"
                max="5"
                step="0.1"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value))}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="reviewText" className="block text-gray-700 text-sm font-bold mb-2">Review:</label>
              <textarea
                id="reviewText"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Write your review here..."
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
              disabled={addReviewMutation.isPending}
            >
              {addReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
            </button>
            {addReviewMutation.isError && (
              <AlertMessage type="error" message={`Failed to submit review: ${getErrorMessage(addReviewMutation.error as AxiosError | Error | null)}`} />
            )}
          </form>
        )}

        {loadingReviews && <p>Loading reviews...</p>}
        {errorReviews && <AlertMessage type="error" message={`Error loading reviews: ${getErrorMessage(reviewsError as AxiosError | Error | null)}`} />}
        {reviews?.length === 0 ? (
          <p className="text-gray-600">No reviews yet. Be the first to review this game!</p>
        ) : (
          <div className="space-y-4">
            {reviews?.map((review: ReviewListViewModel) => (
              <div key={review.userId + '-' + review.productId} className="bg-gray-100 p-4 rounded-md shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold">User: {review.userId}</p>
                  <span className="text-yellow-500 font-bold">{review.rating} / 5 ⭐</span>
                </div>
                <p className="text-gray-700">{review.considerations}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default GameDetailPage;