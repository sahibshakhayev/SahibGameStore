using SahibGameStore.Application.DTOS.Games;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SahibGameStore.Application.Interfaces
{
    public interface IFavoriteServices
    {
        Task<List<FavoriteGameViewDTO>> GetFavoritesByUserAsync(Guid userId);
        Task AddFavoriteAsync(Guid userId, Guid gameId);
        Task RemoveFavoriteAsync(Guid userId, Guid gameId);
    }
}
