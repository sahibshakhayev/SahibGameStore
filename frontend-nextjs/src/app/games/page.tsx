"use client"

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchGenres, fetchDevelopers, fetchPlatforms } from '../../features/games/filterAPI'
import { fetchGames } from '../../features/games/gamesAPI'
import GameCard from '../../components/ui/GameCard'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import { type GameSummary, type PagedGames, type Genre, type Developer, type Platform } from '../../features/games/types'

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

  // Loading skeleton
  if (isLoading && !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full bg-gray-700" />
              <Skeleton className="h-4 w-3/4 bg-gray-700" />
              <Skeleton className="h-4 w-1/2 bg-gray-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <section className="mb-12">
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            All <span className="text-cyan-400">Games</span>
          </h1>
          <p className="text-gray-300 text-lg mb-6">
            Browse through our extensive collection of games for all platforms
          </p>
        </div>
      </section>

      {/* Search & Filters */}
      <div className="mb-8 space-y-6">
        {/* Search Bar */}
        <div className="max-w-2xl">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pl-10 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              placeholder="Search games by name or description..."
              value={search}
              onChange={(e) => { 
                setSearch(e.target.value)
                setPage(1) 
              }}
            />
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sorting Controls */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Sort Options</h3>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-300">Sort by:</label>
                  <select
                    className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
                  >
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="releaseDate">Release Date</option>
                    <option value="usersScore">Score</option>
                  </select>
                </div>
                <Button
                  onClick={() => { setIsDescending((prev) => !prev); setPage(1) }}
                  variant="outline"
                  className="flex items-center space-x-1 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-gray-900"
                >
                  <span>{isDescending ? 'Descending' : 'Ascending'}</span>
                  <svg className={`h-4 w-4 transform ${isDescending ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Filters</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Genre</label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                  <label className="block text-sm font-medium text-gray-300 mb-1">Developer</label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                  <label className="block text-sm font-medium text-gray-300 mb-1">Platform</label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                <Button
                  onClick={() => {
                    setGenreId(undefined)
                    setDeveloperId(undefined)
                    setPlatformId(undefined)
                    setSearch('')
                    setPage(1)
                  }}
                  variant="outline"
                  className="text-sm border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white"
                >
                  Clear all filters
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Info */}
      {data && !isLoading && (
        <div className="mb-6">
          <p className="text-gray-400">
            Showing {data.items.length} of {data.totalCount} games
            {search && <span className="font-medium"> for "{search}"</span>}
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-red-400 mb-2">Error loading games</h3>
          <p className="text-red-300">{error.message}</p>
        </div>
      )}

      {/* Games Grid */}
      {data && !isLoading && (
        <>
          {data.items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {data.items.map((game: GameSummary) => (
                <GameCard key={game.id} game={{ ...game, id: game.id,  usersScore: game.usersScore ?? undefined }} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No games found matching your criteria.</p>
              <Button
                onClick={() => {
                  setGenreId(undefined)
                  setDeveloperId(undefined)
                  setPlatformId(undefined)
                  setSearch('')
                  setPage(1)
                }}
                className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white transition-colors"
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              {/* Previous button */}
              <Button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                variant="outline"
                className="border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                if (pageNum > totalPages) return null
                
                return (
                  <Button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    variant={page === pageNum ? "default" : "outline"}
                    className={page === pageNum 
                      ? "bg-cyan-600 hover:bg-cyan-700 text-white" 
                      : "border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white"
                    }
                  >
                    {pageNum}
                  </Button>
                )
              })}

              {/* Next button */}
              <Button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                variant="outline"
                className="border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default GameListPage