import { useQuery } from '@tanstack/react-query'
import { fetchGames } from '../features/games/gamesAPI'
import GameCard from '../features/games/GameCard'
import { type GameSummary, type PagedGames } from '../features/games/types'

const HomePage = () => {
  const { data, isLoading, error, isError } = useQuery<PagedGames>({
    queryKey: ['games', { pageNumber: 1, pageSize: 3, sortBy: 'popularity', isDescending: true }],
    queryFn: () => fetchGames({ pageNumber: 1, pageSize: 3, sortBy: 'popularity', isDescending: true }),
    retry: 1,
  })

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-50 to-gray-100 p-0 m-0 overflow-auto">
      <div className="w-full h-full p-4">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Featured Games
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the most popular and trending games in our collection
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="w-full max-w-4xl mx-auto">
            <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-red-800">Connection Error</h3>
                  <p className="text-red-700 mt-1">Failed to connect to the API server.</p>
                  <p className="text-sm text-red-600 mt-2">
                    Error: {error?.message || 'Unknown error'}
                  </p>
                  <p className="text-sm text-red-600">Make sure your backend API is running.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Games Grid */}
        {data && (
          <div className="w-full">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {data.items.map((game: GameSummary) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
            
            {/* View All Games CTA */}
            <div className="text-center mt-8">
              <a 
                href="/games" 
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                View All Games
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage