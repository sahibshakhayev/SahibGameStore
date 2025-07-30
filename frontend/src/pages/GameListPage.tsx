import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchGenres, fetchDevelopers, fetchPlatforms } from '../features/games/filterAPI'
import { fetchGames } from '../features/games/gamesAPI'
import GameCard from '../features/games/GameCard'
import { type GameSummary, type PagedGames, type Genre, type Developer, type Platform } from '../features/games/types'

const GameListPage = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<string>('releaseDate')
  const [isDescending, setIsDescending] = useState(true)
  const [genreId, setGenreId] = useState<string | undefined>()
  const [developerId, setDeveloperId] = useState<string | undefined>()
  const [platformId, setPlatformId] = useState<string | undefined>()

  // Fix useQuery syntax for v5
  const { data: genres } = useQuery<Genre[]>({
    queryKey: ['genres'],
    queryFn: fetchGenres,
  })

  const { data: developers } = useQuery<Developer[]>({
    queryKey: ['developers'],
    queryFn: fetchDevelopers,
  })

  const { data: platforms } = useQuery<Platform[]>({
    queryKey: ['platforms'],
    queryFn: fetchPlatforms,
  })

  const { data, isLoading, error } = useQuery<PagedGames>({
    queryKey: ['games', { page, search, sortBy, isDescending, genreId, developerId, platformId }],
    queryFn: () =>
      fetchGames({
        pageNumber: page,
        pageSize: 12,
        searchTerm: search,
        sortBy,
        isDescending,
        genreId,
        developerId,
        platformId,
      }),
    placeholderData: (prev) => prev,
  })

  const totalPages = data ? Math.ceil(data.totalCount / data.pageSize) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">All Games</h1>
          <p className="text-gray-600">Browse our complete collection of games</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              placeholder="Search games by name..."
              value={search}
              onChange={(e) => { 
                setSearch(e.target.value)
                setPage(1) 
              }}
            />
          </div>
        </div>

        {/* Sorting & Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sorting Controls */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Sort Options</h3>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Sort by:</label>
                  <select
                    className="px-3 py-2 border text-black  border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
                  >
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="releaseDate">Release Date</option>
                    <option value="usersScore">Score</option>
                  </select>
                </div>
                <button
                  onClick={() => { setIsDescending((prev) => !prev); setPage(1) }}
                  className="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:text-blue-700 font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#000000',
                            cursor: 'pointer',
                          }}
                >
                  <span>{isDescending ? 'Descending' : 'Ascending'}</span>
                  <svg className={`h-4 w-4 transform ${isDescending ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                  <select 
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    value={genreId || ''} 
                    onChange={(e) => { setGenreId(e.target.value || undefined); setPage(1) }}
                  >
                    <option value="">All Genres</option>
                    {genres?.map((g: Genre) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Developer</label>
                  <select 
                    className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    value={developerId || ''} 
                    onChange={(e) => { setDeveloperId(e.target.value || undefined); setPage(1) }}
                  >
                    <option value="">All Developers</option>
                    {developers?.map((d: Developer) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                  <select 
                    className="w-full px-3 py-2 text-black  border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    value={platformId || ''} 
                    onChange={(e) => { setPlatformId(e.target.value || undefined); setPage(1) }}
                  >
                    <option value="">All Platforms</option>
                    {platforms?.map((p: Platform) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              {(genreId || developerId || platformId || search) && (
                <button
                  onClick={() => {
                    setGenreId(undefined)
                    setDeveloperId(undefined)
                    setPlatformId(undefined)
                    setSearch('')
                    setPage(1)
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Info */}
        {data && !isLoading && (
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600">
              Showing {data.items.length} of {data.totalCount} games
              {search && <span className="font-medium"> for "{search}"</span>}
            </p>
            <div className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error loading games</h3>
            <p className="text-red-600">{error.message}</p>
          </div>
        )}

        {/* Games Grid */}
        {data && !isLoading && (
          <>
            {data.items.length > 0 ? (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
                {data.items.map((game: GameSummary) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.54-.676-6.392-1.849" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No games found</h3>
                <p className="text-gray-500">Try adjusting your search terms or filters</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                {/* Previous button */}
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                  if (pageNum > totalPages) return null
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                        page === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}

                {/* Next button */}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default GameListPage