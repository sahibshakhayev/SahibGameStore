using SahibGameStore.Domain.Entities;

namespace SahibGameStore.Domain.Interfaces.Repositories
{
    public interface IOrderRepository {



        Task<IEnumerable<Order>> GetAllAsync();

        Task<IEnumerable<Order>> GetByUserIdAsync(Guid id);
        int CancelOrder(Guid orderId);
        void CreateOrder(Order order);
    }
}