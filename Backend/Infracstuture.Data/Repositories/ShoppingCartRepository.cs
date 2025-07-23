using System;
using System.Linq;
using System.Threading.Tasks;
using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using SahibGameStore.Infracstuture.Data.Context;
using SahibGameStore.Infracstuture.Data.Repositories.Common;
using SahibGameStore.Domain.Entities.Common;

namespace SahibGameStore.Infracstuture.Data.Repositories
{
    public class ShoppingCartRepository : Repository<ShoppingCart>, IShoppingCartRepository
    {
        private SahibGameStoreContext _db;
        public ShoppingCartRepository(SahibGameStoreContext db) : base(db)
        {
            _db = db;
        }

        public async Task<ShoppingCart> GetByUserIdAsync(Guid userId)
        {
            return await _db.ShoppingCarts.Include(c => c.Items).ThenInclude(i => i.Game).FirstOrDefaultAsync(c => c.UserId == userId && !c.IsDeleted);
        }

        public async Task AddAsync(ShoppingCart entity)
        {
            await _db.ShoppingCarts.AddAsync(entity);
            await _db.SaveChangesAsync();
        }

        public async Task UpdateAsync(ShoppingCart entity)
        {
            _db.ShoppingCarts.Update(entity);
            await _db.SaveChangesAsync();
        }
    }

}