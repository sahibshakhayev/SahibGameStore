using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Entities.Common;
using System;
using System.Threading.Tasks;

namespace SahibGameStore.Domain.Interfaces.Repositories
{
    public interface IShoppingCartRepository: IRepository<ShoppingCart>
    {
        Task<ShoppingCart> GetCartByUserId(Guid userId);

        ShoppingCart GetActiveShoppingCartByUser(Guid userId);
        Task CreateCart(ShoppingCart currentCart);

        Task AddItemtoCart(ShoppingCart currentCart, Product product);

        Task RemoveItemFrom(ShoppingCart currentCart, CartItem item);

        Task UpdateItemQuantity(ShoppingCart currentCart, CartItem item);



        
    }
}
