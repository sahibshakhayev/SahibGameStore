import { GameSummary } from './types';

export default function GameCard({ game }: { game: GameSummary }) {
  return (
    <div className="group relative w-56 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-b from-gray-800/80 to-gray-900/90 backdrop-blur-md shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 border border-gray-700/50">
      {/* Game Cover */}
      <div className="relative w-full h-72 overflow-hidden">
        <img
          src={process.env.NEXT_PUBLIC_API_URL + game.imageRelativePath}
          alt={game.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-90" />
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col justify-between h-40">
        {/* Title */}
        <h3 className="text-white text-lg font-bold leading-tight line-clamp-2 group-hover:text-indigo-400 transition-colors duration-300">
          {game.name}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-2">{game.shortDescription}</p>

        {/* Footer */}
        <div className="flex justify-between items-center mt-3">
          <span className="text-green-400 font-bold text-lg">${game.price}</span>
          {game.usersScore && (
            <span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-sm font-semibold shadow-sm">
              ⭐ {game.usersScore.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
