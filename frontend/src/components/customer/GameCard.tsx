// src/components/customer/GameCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { type GameListViewModel } from '../../types/api.ts';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../features/cart/cartSlice';

interface GameCardProps {
  game: GameListViewModel;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const dispatch = useDispatch();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to detail page
    dispatch(addToCart(game));
    alert(`${game.name} added to cart!`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link to={`/games/${game.id}`}>
        {game.coverImageRelativePath && (
          <img
            src={"http://localhost:5159" + game.coverImageRelativePath}
            alt={game.name || 'Game Cover'}
            className="w-full h-48 object-cover"
          />
        )}
        {!game.coverImageRelativePath && game.imageRelativePath && (
          <img
            src={game.imageRelativePath}
            alt={game.name || 'Game Thumbnail'}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="p-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate">{game.name}</h3>
          <p className="text-sm text-gray-600 mb-2 h-12 overflow-hidden">{game.shortDescription}</p>
          <div className="flex justify-between items-center mt-4">
            <span className="text-lg font-bold text-blue-600">${game.price?.toFixed(2)}</span>
            <span className="text-yellow-500 text-sm font-semibold">{game.usersScore?.toFixed(1)} ⭐</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Available: {game.availableQuantity}</p>
          <button
            onClick={handleAddToCart}
            className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            disabled={game.availableQuantity === 0}
          >
            {game.availableQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </Link>
    </div>
  );
};

export default GameCard;