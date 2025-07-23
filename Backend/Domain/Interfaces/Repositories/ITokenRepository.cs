using System.Collections.Generic;
using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Entities.Common;

namespace SahibGameStore.Domain.Interfaces.Repositories
{
    public interface ITokenRepository : IRepository<Token>
    {
        Task<Token> GetTokenbyAccessToken(string token);

        Task<Token> GetTokenbyUserId(Guid userId);
    }
}