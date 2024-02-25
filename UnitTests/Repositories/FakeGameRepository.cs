using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Entities.Common;
using SahibGameStore.Domain.Entities.Enums;
using SahibGameStore.Domain.Interfaces.Repositories;
using SahibGameStore.Infracstuture.Data.Context;
using SahibGameStore.Infracstuture.Data.Repositories.Common;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SahibGameStore.UnitTests.Repositories
{
    public class FakeGameRepository : FakeRepository<Game>, IGameRepository
    {
        private SahibGameStoreContext _db;
        
        public FakeGameRepository()
        {
            for (var i = 0; i < 10; i++)
            {
                base._entities.Add(new Game("Fictional Tests", "New fictional game.",
                "new fictional games.",
                EDepartment.Game, 89.99, new DateTime(2018, 1, 1),5));
            }
        }

        public Task AddOrUpdateOverview(GameOverview gameOverview)
        {
            throw new NotImplementedException();
        }

        public async Task<IEnumerable<Game>> GetAllGamesFromThisGenreAsync(Guid genreId)
        {
            return await Task.Run(() =>
            {
                return _entities.Where(_ => _.GameGenres.Any(x => x.GenreId == genreId)).ToList();
            });
        }

        public async Task<IEnumerable<dynamic>> GetAllGamesWithDevelopersAsync()
        {
            var query = from game in _db.Games
                        select new { game };

            return await query.ToListAsync();
        }

        public async Task<IEnumerable<Game>> GetBestRatedGamesAsync()
        {
            var query = from games in _db.Games
                            orderby games.UsersScore
                            select games;
            return await query.ToListAsync();
        }

        public Task<IEnumerable<Game>> GetBestSellerGamesAsync()
        {
            throw new NotImplementedException();
        }

        public Task<GameOverview> GetOverview(Guid gameId)
        {
            throw new NotImplementedException();
        }

        public IEnumerable<Game> SearchByName(string search)
        {
            return _db.Games.Where(p => p.Name.Contains(search));
        }
    }
}
