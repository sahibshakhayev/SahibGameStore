using SahibGameStore.Domain.Entities;

namespace SahibGameStore.Domain.Interfaces.Repositories
{
    public interface IOrderRepository {



        Task<Order> GetByIdAsync(Guid id);
        Task<(IEnumerable<Order> orders, int totalCount) > GetAllAsync(int page, int pageSize, Guid? userFilter = null);
        Task<(IEnumerable<Order> orders, int totalCount)> GetByUserAsync(Guid userId, int page, int pageSize);
        Task AddAsync(Order order);
        Task UpdateAsync(Order order);
    }
}
