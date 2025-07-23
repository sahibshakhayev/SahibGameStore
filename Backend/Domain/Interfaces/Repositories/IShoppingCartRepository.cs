using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Entities.Common;
using System;
using System.Threading.Tasks;

namespace SahibGameStore.Domain.Interfaces.Repositories
{
    public interface IShoppingCartRepository: IRepository<ShoppingCart>
    {



        Task<ShoppingCart> GetByUserIdAsync(Guid userId);
        Task AddAsync (ShoppingCart item);
        Task UpdateAsync (ShoppingCart item);
        



    }
}
