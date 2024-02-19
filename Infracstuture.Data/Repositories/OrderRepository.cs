using System.Linq;
using SahibGameStore.Infracstuture.Data.Context;
using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Interfaces.Repositories;

namespace SahibGameStore.Infracstuture.Data.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        private SahibGameStoreContext _db;
        public OrderRepository(SahibGameStoreContext db)
        {
            _db = db;
        }
        public void CreateOrder(Order order)
        {
            _db.Orders.Add(order);
            _db.SaveChanges();
        }

        public void FinishOrder(Order order)
        {
            var cart = _db.ShoppingCarts.Where(_ => _.Id == order.ShoppingCart.Id).FirstOrDefault();
            order.Deactivate();
            cart.Deactivate();
        }
    }
}