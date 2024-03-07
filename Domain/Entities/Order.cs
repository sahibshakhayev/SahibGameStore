using SahibGameStore.Domain.Entities.Common;
using SahibGameStore.Domain.ValueObjects;
using System;

namespace SahibGameStore.Domain.Entities
{
    public class Order : BaseEntity
    {
        protected Order() { }
        public Order(Guid userId, ShoppingCart shoppingCart, Payment payment)
        {
            UserId = userId;
            ShoppingCart = shoppingCart;
            FormOfPayment = payment;

            if (ShoppingCart is null)
                AddNonconformity(new Nonconformity("order.shoppingCart", "Shopping Cart cannot be empty to issue an order."));
            if (FormOfPayment is null)
                AddNonconformity(new Nonconformity("order.payment", "Any order should have a least one method of payment."));

            AddNonconformity(ShoppingCart,FormOfPayment);
        }

        public Guid UserId { get; private set; }
        public Payment FormOfPayment { get; private set; }
        public ShoppingCart ShoppingCart { get; private set; }
    }
}
