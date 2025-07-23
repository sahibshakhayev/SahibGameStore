using System.Collections.Generic;
using System.Threading.Tasks;
using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using SahibGameStore.Infracstuture.Data.Context;
using SahibGameStore.Infracstuture.Data.Repositories.Common;

namespace SahibGameStore.Infracstuture.Data.Repositories
{
    public class PlatformRepository : Repository<Platform>, IPlatformRepository
    {
        private SahibGameStoreContext _db;
        public PlatformRepository(SahibGameStoreContext db) : base(db)
        {
            _db = db;
        }

        public override async Task<IEnumerable<Platform>> GetAllAsync()
        {
            return await _db.Platforms
                            .Include(x => x.GamePlatforms)
                            .ThenInclude(x => x.Game)
                            .ToListAsync();
        }
    }
}