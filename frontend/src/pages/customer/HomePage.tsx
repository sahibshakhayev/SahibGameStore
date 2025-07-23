// src/pages/customer/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import {
  useGetApiGamesBestrated,
  useGetApiGamesBestsellers
} from '../../lib/api/endpoints';
import GameCard from '../../components/customer/GameCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import type { GameListViewModel } from '../../types/api.ts';

const HomePage: React.FC = () => {
  const { data: bestRatedGames, isLoading: loadingBestRated, isError: errorBestRated, error: bestRatedError } = useGetApiGamesBestrated();
  const { data: bestSellersGames, isLoading: loadingBestSellers, isError: errorBestSellers, error: bestSellersError } = useGetApiGamesBestsellers();

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

  if (loadingBestRated || loadingBestSellers) {
    return <LoadingSpinner />;
  }

  // Pass explicitly typed error objects to getErrorMessage
  if (errorBestRated) {
    return <AlertMessage type="error" message={`Error loading best rated games: ${getErrorMessage(bestRatedError as AxiosError | Error | null)}`} />;
  }
  if (errorBestSellers) {
    return <AlertMessage type="error" message={`Error loading best sellers: ${getErrorMessage(bestSellersError as AxiosError | Error | null)}`} />;
  }

  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Welcome to the Game Store!</h1>

      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-gray-700 mb-6">🏆 Best Rated Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {bestRatedGames?.length === 0 ? (
            <p className="col-span-full text-center text-gray-600">No best rated games available.</p>
          ) : (
            bestRatedGames?.map((game: GameListViewModel) => (
              <GameCard key={game.id} game={game} />
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-semibold text-gray-700 mb-6">🔥 Best Sellers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {bestSellersGames?.length === 0 ? (
            <p className="col-span-full text-center text-gray-600">No best seller games available.</p>
          ) : (
            bestSellersGames?.map((game: GameListViewModel) => (
              <GameCard key={game.id} game={game} />
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;