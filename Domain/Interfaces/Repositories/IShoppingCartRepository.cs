using SahibGameStore.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace SahibGameStore.Domain.Interfaces.Repositories
{
    public interface IShoppingCartRepository: IRepository<ShoppingCart>
    {
        Task<ShoppingCart> GetCartByUserId(Guid userId);
        Task CreateCart(ShoppingCart currentCart);
    }
}
