using SahibGameStore.Domain.Entities;

namespace SahibGameStore.Domain.Interfaces.Repositories
{
    public interface IOrderRepository {
        void CreateOrder(Order order);
    }
}