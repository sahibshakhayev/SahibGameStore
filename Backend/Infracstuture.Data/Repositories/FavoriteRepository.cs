using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Entities.ReleationshipEntities;
using SahibGameStore.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using SahibGameStore.Infracstuture.Data.Context;
using SahibGameStore.Infracstuture.Data.Repositories.Common;

namespace SahibGameStore.Infracstuture.Data.Repositories
{
    public class FavoriteRepository : Repository<Favorite>, IFavoriteRepository
    {
        private SahibGameStoreContext _db;
        public FavoriteRepository(SahibGameStoreContext db) : base(db)
        {
            _db = db;
        }

        public async Task<List<Favorite>> GetFavoritesByUserIdAsync(Guid userId)
        {
            return await _db.Favorites
                .Where(f => f.UserId == userId)
                .Include(f => f.Game)
                .ToListAsync();
        }

        public async Task<Favorite?> GetByUserAndGameAsync(Guid userId, Guid gameId)
        {
            return await _db.Favorites
                .FirstOrDefaultAsync(f => f.UserId == userId && f.GameId == gameId);
        }

        public async Task AddAsync(Favorite favorite)
        {
            await _db.Favorites.AddAsync(favorite);
        }

        public async Task RemoveAsync(Favorite favorite)
        {
            _db.Favorites.Remove(favorite);
        }

        public async Task SaveChangesAsync()
        {
            await _db.SaveChangesAsync();
        }
    }
}