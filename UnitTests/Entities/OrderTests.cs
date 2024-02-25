using System;
using System.Collections.Generic;
using System.Linq;
using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Entities.Common;
using SahibGameStore.Domain.ValueObjects;
using SahibGameStore.UnitTests.Repositories;
using Xunit;

namespace SahibGameStore.UnitTests.Entities
{
    public class OrderTests
    {
        private FakeGameRepository _repository;
        private IList<CartItem> listOfItems = new List<CartItem>();
        private Payment payment;

        public OrderTests()
        {
            _repository = new FakeGameRepository();
           
                listOfItems.Add(new CartItem(
                    _repository._entities.FirstOrDefault(),
                    3));
            
        }

        [Fact]
        public void ShouldReturnErrorWhenShoppingCartIsNull()
        {
            var userGuid = Guid.NewGuid();
            payment = new CreditCardPayment(
               "Sahib Shakhayev",
               "123456789",
               DateTime.Now,
               DateTime.Now.AddDays(1),
               6000,
               6000,
               "Sahib Shakhayev",
               new Email("sahib@email.az"));

            var fakeOrder = new Order(new Guid(), null, payment);
            Assert.True(fakeOrder.Nonconformities.Count == 1);
            Assert.Equal(fakeOrder.Nonconformities[0].Property, "order.shoppingCart");
            Assert.Equal(false, fakeOrder.IsValid);
        }

        [Fact]
        public void ShouldReturnErrorWhenPaymentIsNull()
        {
            var userGuid = Guid.NewGuid();
            var shoppingCart = new ShoppingCart(userGuid, listOfItems);

            var fakeOrder = new Order(new Guid(), shoppingCart, null);

            Assert.True(fakeOrder.Nonconformities.Count == 1);
            Assert.Equal(fakeOrder.Nonconformities[0].Property, "order.payment");
            Assert.Equal(false, fakeOrder.IsValid);
        }

        [Fact]
        public void ShouldAddSeveralValidationMessages()
        {
            payment = new CreditCardPayment(
               "Sahib Shakhayev",
               "123456789",
               DateTime.Now,
               DateTime.Now.AddDays(-1),
               6000,
               5000,
               "Sahib Shakhayev",
               null);
            var fakeOrder = new Order(new Guid(), null, payment);
            Assert.True(fakeOrder.Nonconformities.Count > 1);
        }
    }
}