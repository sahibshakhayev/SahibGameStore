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
    public class ComapanyRepository : Repository<Company>, ICompanyRepository
    {
        private SahibGameStoreContext _db;
        public ComapanyRepository(SahibGameStoreContext db) : base(db)
        {
            _db = db;
        }

        public override async Task<IEnumerable<Company>> GetAllAsync()
        {
            return await _db.Companies
                      .Include(_ => _.GameDevelopers)
                      .ThenInclude(_ => _.Game)
                      .Include(_ => _.GamePublishers)
                      .ThenInclude(_ => _.Game)
                      .ToListAsync();
        }

        public override async Task<Company> GetByIdAsync(Guid id)
        {
            return await _db.Companies
                      .Include(_ => _.GameDevelopers)
                      .ThenInclude(_ => _.Game)
                      .Where(_ => _.Id == id)
                      .FirstOrDefaultAsync();
        }
    }
}