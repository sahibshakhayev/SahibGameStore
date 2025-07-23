using SahibGameStore.Domain.Entities.Common;
using SahibGameStore.Domain.ValueObjects;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace SahibGameStore.Domain.Entities
{
    public enum OrderStatus
    {
        Created,
        Pending,
        Preparing,
        Delivering,
        Delivered,
        Canceled
    }

    public class Order : BaseEntity
    {
        protected Order() { }

        public Order(Guid userId, ShoppingCart shoppingCart, Payment payment, string? address)
        {
            UserId = userId;
            ShoppingCart = shoppingCart;
            FormOfPayment = payment;
            Address = address;
            Status = OrderStatus.Created;

            if (ShoppingCart is null)
                AddNonconformity(new Nonconformity("order.shoppingCart", "Shopping Cart cannot be empty to issue an order."));
            if (FormOfPayment is null)
                AddNonconformity(new Nonconformity("order.payment", "Any order should have a least one method of payment."));
            if (string.IsNullOrWhiteSpace(address))
                AddNonconformity(new Nonconformity("order.address", "Delivery address is required."));

            AddNonconformity(ShoppingCart, FormOfPayment);
        }

        public Guid UserId { get; private set; }
        public Payment FormOfPayment { get; private set; }

        public OrderStatus Status { get; private set; }
        public string Address { get; private set; }

        public Guid ShoppingCartId { get; private set; }

        [ForeignKey("ShoppingCartId")]
        public ShoppingCart ShoppingCart { get; private set; }

        public void ChangeStatus(OrderStatus status)
        {
            Status = status;
        }

        public void UpdateAddress(string address)
        {
            if (!string.IsNullOrWhiteSpace(address))
                Address = address;
        }

        public void Cancel()
        {
            if (Status == OrderStatus.Created || Status == OrderStatus.Pending)
                Status = OrderStatus.Canceled;
        }
    }

}
