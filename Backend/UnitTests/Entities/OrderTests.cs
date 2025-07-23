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
        private IList<CartItem> listOfItems;
        private Payment payment;

        public OrderTests()
        {
            _repository = new FakeGameRepository();
            var game = _repository._entities.First();

            listOfItems = new List<CartItem>
        {
            new CartItem(game.Id, 3) { Game = game }
        };
        }

        [Fact]
        public void ShouldReturnErrorWhenShoppingCartIsNull()
        {
            payment = new CreditCardPayment(
               DateTime.Now,
               DateTime.Now.AddDays(1),
               6000,
               6000,
               "Sahib Shakhayev",
               new Email("sahib@email.az"),
               "Sahib Shakhayev",
               "123456789",
               Guid.NewGuid().ToString().Replace("-",""));

            var fakeOrder = new Order(Guid.NewGuid(), null, payment, "Test Adress");

            Assert.Single(fakeOrder.Nonconformities);
            Assert.Equal("order.shoppingCart", fakeOrder.Nonconformities[0].Property);
            Assert.False(fakeOrder.IsValid);
        }

        [Fact]
        public void ShouldReturnErrorWhenPaymentIsNull()
        {
            var shoppingCart = new ShoppingCart(Guid.NewGuid());

            shoppingCart.Items = listOfItems;

            var fakeOrder = new Order(Guid.NewGuid(), shoppingCart, null,"Test Adresss");

            Assert.Single(fakeOrder.Nonconformities);
            Assert.Equal("order.payment", fakeOrder.Nonconformities[0].Property);
            Assert.False(fakeOrder.IsValid);
        }

        [Fact]
        public void ShouldAddSeveralValidationMessages()
        {
            payment = new CreditCardPayment(
             DateTime.Now,
               DateTime.Now.AddDays(1),
               6000,
               6000,
               "Sahib Shakhayev",
               new Email("sahib@email.az"),
               "Sahib Shakhayev",
               "123456789",
               null);

            var fakeOrder = new Order(Guid.NewGuid(), null, payment, null);

            Assert.True(fakeOrder.Nonconformities.Count > 1);
        }
    }

}