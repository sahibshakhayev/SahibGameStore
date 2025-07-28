import { Link } from 'react-router-dom'
import { type GameSummary } from './types'

const GameCard = ({ game }: { game: GameSummary }) => (
  <Link 
    to={`/games/${game.id}`} 
    className="block bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 group"
  >
    <div className="relative overflow-hidden">
      {game.imageRelativePath ? (
        <img 
          src={import.meta.env.VITE_API_BASE_URL + game.imageRelativePath} 
          alt={game.name} 
          className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-300" 
        />
      ) : (
        <div className="w-full h-48 sm:h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
    
    <div className="p-5">
      <h2 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
        {game.name}
      </h2>
      
      <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">
        {game.shortDescription}
      </p>
      
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-gray-900">
          ${game.price.toFixed(2)}
        </span>
        
        <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors duration-200">
          View Details
          <svg className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  </Link>
)

export default GameCard