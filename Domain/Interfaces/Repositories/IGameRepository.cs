﻿using SahibGameStore.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SahibGameStore.Domain.Interfaces.Repositories
{
    public interface IGameRepository: IRepository<Game>
    {
        IEnumerable<Game> SearchByName(string search);

        Task<(IEnumerable<Game> games, int totalCount)> GetGamesAsync(GameQueryParameters queryParams);

        Task<IEnumerable<dynamic>> GetAllGamesWithDevelopersAsync();
        Task<IEnumerable<Game>> GetAllGamesFromThisGenreAsync(Guid genreId);
        Task<IEnumerable<Game>> GetBestRatedGamesAsync();
        Task<IEnumerable<Game>> GetBestSellerGamesAsync();
        Task<GameOverview> GetOverview(Guid gameId);
        Task AddOrUpdateOverview(GameOverview gameOverview);
    }
}
