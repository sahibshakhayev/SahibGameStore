using SahibGameStore.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SahibGameStore.Domain.Interfaces.Repositories
{
    public interface IFavoriteRepository:IRepository<Favorite>
    {
        Task<List<Favorite>> GetFavoritesByUserIdAsync(Guid userId);
        Task<Favorite?> GetByUserAndGameAsync(Guid userId, Guid gameId);
        Task AddAsync(Favorite favorite);
        Task RemoveAsync(Favorite favorite);
        Task SaveChangesAsync();
    }
}
