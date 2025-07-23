using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Interfaces.Repositories;
using SahibGameStore.Infracstuture.Data.Repositories.Common;
using Microsoft.EntityFrameworkCore;
using SahibGameStore.Infracstuture.Data.Context;

namespace SahibGameStore.Infracstuture.Data.Repositories
{
    public class GenreRepository : Repository<Genre>, IGenreRepository
    {
        private SahibGameStoreContext _db;
        public GenreRepository(SahibGameStoreContext db) : base(db)
        {
            _db = db;
        }

        public override async Task<IEnumerable<Genre>> GetAllAsync() {
            return await  _db.Genres
                            .Include(x => x.GameGenres)
                            .ThenInclude(x => x.Game)
                            .ToListAsync();
        }

        public override async Task<Genre> GetByIdAsync(Guid id)
        {
            return await _db.Genres
                      .Include(_ => _.GameGenres)
                      .ThenInclude(_ => _.Game)
                      .Where(_ => _.Id == id)
                      .FirstOrDefaultAsync();
        }
    }
}