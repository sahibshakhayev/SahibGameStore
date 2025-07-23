// src/pages/customer/GameListPage.tsx
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import {
  useGetApiGames,
  useGetApiGenres,
  useGetApiPlatforms,
  useGetApiCompanies,
  getApiGames // Still needed for Awaited<ReturnType>
} from '../../lib/api/endpoints';
import GameCard from '../../components/customer/GameCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import type {
  GameListViewModel,
  GenreViewModel,
  PlatformViewModel,
  CompanyViewModel,
} from '../../types/api.ts';
import type { PagedResultOfGameListViewModel } from '../../types/custom'; // <--- NEW: Import from custom.d.ts

const GameListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('searchTerm') || '');
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genreId') || '');
  const [selectedPlatform, setSelectedPlatform] = useState(searchParams.get('platformId') || '');
  const [selectedDeveloper, setSelectedDeveloper] = useState(searchParams.get('developerId') || '');

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

  

  const { data: genres, isLoading: loadingGenres, isError: errorGenres, error: genresError } = useGetApiGenres<GenreViewModel[], AxiosError>();
  const { data: platforms, isLoading: loadingPlatforms, isError: errorPlatforms, error: platformsError } = useGetApiPlatforms<PlatformViewModel[], AxiosError>();
  const { data: companies, isLoading: loadingCompanies, isError: errorCompanies, error: companiesError } = useGetApiCompanies<CompanyViewModel[], AxiosError>();

  // --- FIX: Expect PagedResultOfGameListViewModel as data type ---
  const {
    data: gamesResult, // Renamed to gamesResult to emphasize it's the full paginated object
    isLoading,
    isError,
    error
  } = useGetApiGames<PagedResultOfGameListViewModel, AxiosError>( // <--- NEW: Expect PagedResult type
    {
      PageNumber: 1, // Defaulting, implement pagination controls later
      PageSize: 20,
      SearchTerm: searchTerm || undefined,
      GenreId: selectedGenre || undefined,
      PlatformId: selectedPlatform || undefined,
      DeveloperId: selectedDeveloper || undefined,
    },
    { query: {} }
  );

  // --- FIX: Extract the items array for mapping ---
  const games = gamesResult?.items || []; // Access items array, default to empty if null/undefined


  

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setSearchParams((prev: URLSearchParams) => {
      if (value) {
        prev.set(filterType, value);
      } else {
        prev.delete(filterType);
      }
      return prev;
    });
    if (filterType === 'genreId') setSelectedGenre(value);
    if (filterType === 'platformId') setSelectedPlatform(value);
    if (filterType === 'developerId') setSelectedDeveloper(value);
  };

  if (isLoading || loadingGenres || loadingPlatforms || loadingCompanies) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <AlertMessage type="error" message={`Error loading games: ${getErrorMessage(error as AxiosError | Error | null)}`} />;
  }
  if (errorGenres) {
    return <AlertMessage type="error" message={`Error loading genres: ${getErrorMessage(genresError as AxiosError | Error | null)}`} />;
  }
  if (errorPlatforms) {
    return <AlertMessage type="error" message={`Error loading platforms: ${getErrorMessage(platformsError as AxiosError | Error | null)}`} />;
  }
  if (errorCompanies) {
    return <AlertMessage type="error" message={`Error loading companies: ${getErrorMessage(companiesError as AxiosError | Error | null)}`} />;
  }

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Browse Games</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search games..."
          className="p-2 border text-gray-800 border-gray-300 rounded-md col-span-full md:col-span-1"
          value={searchTerm}
          onChange={handleSearchChange}
        />

        <select
          className="p-2 border text-gray-800 border-gray-300 rounded-md"
          value={selectedGenre}
          onChange={(e) => handleFilterChange('genreId', e.target.value)}
        >
          <option value="">All Genres</option>
          {genres?.map((genre: GenreViewModel) => (
            <option key={genre.id} value={genre.id}>{genre.name}</option>
          ))}
        </select>

        <select
          className="p-2 border text-gray-800 border-gray-300 rounded-md"
          value={selectedPlatform}
          onChange={(e) => handleFilterChange('platformId', e.target.value)}
        >
          <option value="">All Platforms</option>
          {platforms?.map((platform: PlatformViewModel) => (
            <option key={platform.id} value={platform.id}>{platform.name}</option>
          ))}
        </select>

        <select
          className="p-2 border text-gray-800  border-gray-300 rounded-md"
          value={selectedDeveloper}
          onChange={(e) => handleFilterChange('developerId', e.target.value)}
        >
          <option value="">All Developers</option>
          {companies?.map((company: CompanyViewModel) => (
            <option key={company.id} value={company.id}>{company.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 text-gray-800 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* --- FIX: Use games.length for check and games.map directly --- */}
        {games.length === 0 ? ( // games is now definitively an array or empty array
          <p className="col-span-full text-center text-gray-600">No games found matching your criteria.</p>
        ) : (
          games.map((game: GameListViewModel) => ( // games is now an array, no ?. or cast needed
            <GameCard key={game.id} game={game} />
          ))
        )}
      </div>
    </div>
  );
};

export default GameListPage;