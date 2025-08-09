using AutoMapper;
using SahibGameStore.Application.DTOS.Companies;
using SahibGameStore.Application.DTOS.Games;
using SahibGameStore.Application.Interfaces;
using SahibGameStore.Application.ViewModels;
using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SahibGameStore.Application.Services
{
    public class FavoriteServices : IFavoriteServices
    {
        private IUnitOfWork _unit;
        private IMapper _mapper;
        public FavoriteServices(IUnitOfWork unit, IMapper mapper)
        {
            _unit = unit;
            _mapper = mapper;
        }



        public async Task<List<FavoriteGameViewDTO>> GetFavoritesByUserAsync(Guid userId)
        {
            var favorites = await _unit.Favorites.GetFavoritesByUserIdAsync(userId);

            return favorites.Select(f => new FavoriteGameViewDTO
            {
                GameId = f.GameId,
                Name = f.Game.Name,
                CoverImageUrl = f.Game.ImageRelativePath
            }).ToList();
        }

        public async Task AddFavoriteAsync(Guid userId, Guid gameId)
        {
            var existing = await _unit.Favorites.GetByUserAndGameAsync(userId, gameId);
            if (existing != null) return;

            var game = await _unit.Games.GetByIdAsync(gameId);

            if (game == null) return;



            var favorite = new Favorite(userId, game);

            await _unit.Favorites.AddAsync(favorite);
            await _unit.Favorites.SaveChangesAsync();
        }

        public async Task RemoveFavoriteAsync(Guid userId, Guid gameId)
        {
            var existing = await _unit.Favorites.GetByUserAndGameAsync(userId, gameId);
            if (existing == null) return;

            await _unit.Favorites.RemoveAsync(existing);
            await _unit.Favorites.SaveChangesAsync();
        }








    }
}