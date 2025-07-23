using SahibGameStore.Domain.Entities.Common;
using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Interfaces.Repositories;
using SahibGameStore.Infracstuture.Data.Context;
using SahibGameStore.Infracstuture.Data.Repositories.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;

namespace SahibGameStore.Infracstuture.Data.Repositories
{
    public class TokenRepository : Repository<Token>, ITokenRepository
    {
        private SahibGameStoreContext _db;
        public TokenRepository(SahibGameStoreContext db) : base(db)
        {
            _db = db;
        }

        public async Task<Token> GetTokenbyAccessToken(string token)
        {
            return _db.Tokens.Where(t => t.AccessToken == token).FirstOrDefault();
        }

        public async Task<Token> GetTokenbyUserId(Guid userId)
        {
            return _db.Tokens.Where(t => t.UserId == userId).FirstOrDefault();
        }
    }
}
