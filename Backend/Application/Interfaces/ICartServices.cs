using Application.DTOS.Cart;
using SahibGameStore.Application.DTOS.Cart;
using SahibGameStore.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace SahibGameStore.Application.Interfaces
{
    public interface ICartServices
    {
        Task<ShoppingCartDto> GetCartAsync(Guid userId);
        Task AddAsync(Guid userId, Guid gameId, int qty);
        Task UpdateAsync(Guid userId, Guid gameId, int qty);
        Task RemoveAsync(Guid userId, Guid gameId);
        Task SubmitOrderAsync(Guid userId);
    }

}
