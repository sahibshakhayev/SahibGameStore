using SahibGameStore.Application.DTOS.Cart;
using SahibGameStore.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace SahibGameStore.Application.Interfaces
{
    public interface ICartServices
    {

        Task<ShoppingCart> GetUserCart(Guid userId);
        Task AddItemToCart(CartItemDTO item, Guid userId);
        Task RemoveItemFromCart(CartItemDTO item, Guid UserId);

        Task SetItemQuantity(CartItemDTO item, Guid UserId, int newQuantity);


    }
}
