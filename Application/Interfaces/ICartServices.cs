using SahibGameStore.Application.DTOS.Cart;
using System;
using System.Threading.Tasks;

namespace SahibGameStore.Application.Interfaces
{
    public interface ICartServices
    {
        Task AddItemToCart(CartItemDTO item, Guid userId);
    }
}
