using System.Collections.Generic;
using System.Linq;
using SahibGameStore.Infracstuture.Data.Context;
using SahibGameStore.Infracstuture.Data.Repositories.Common;
using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Interfaces.Repositories;

namespace SahibGameStore.Infracstuture.Data.Repositories
{
    public class UserRepository : Repository<User>, IUserRepository
    {
        private SahibGameStoreContext _db;
        public UserRepository(SahibGameStoreContext db) : base(db)
        {
            _db = db;
        }
    }
}