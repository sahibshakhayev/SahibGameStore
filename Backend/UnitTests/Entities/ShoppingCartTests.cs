using SahibGameStore.Domain.Entities;
using SahibGameStore.UnitTests.Repositories;
using Xunit;
using System.Linq;
using System;
using System.Collections.Generic;

namespace SahibGameStore.UnitTests.Entities
{
    public class ShoppingCartTests
    {
        private FakeGameRepository _repository;
        private IList<CartItem>? listOfItems = new List<CartItem>();
        public ShoppingCartTests()
        {
            _repository = new FakeGameRepository();
           
                listOfItems.Add(new CartItem(
                    _repository._entities.FirstOrDefault().Id,
                    3));
            
        }
        [Fact]
        public void ShouldReturnErrorWhenCartItemQuantityExceedAvaliableInStock()
        {
            var product = _repository._entities.FirstOrDefault();
            var shoppingCart = new ShoppingCart(Guid.NewGuid());

            var ex = Assert.Throws<ApplicationException>(() =>
            {
                shoppingCart.AddItem(product, 15);
            });

            Assert.Equal("Insufficient stock", ex.Message);
        }

        [Fact]
        public void ShouldReturnSuccessWhenAddingAnValidItemToShoppingCart()
        {
            var product = _repository._entities.FirstOrDefault();
            var cartItem = new CartItem(product.Id, 1);
            var shoppingCart = new ShoppingCart(Guid.NewGuid());

            shoppingCart.AddItem(product, cartItem.Quantity);

            Assert.True(shoppingCart.Nonconformities.Count == 0);
            Assert.Equal(true, shoppingCart.IsValid);
        }

        [Fact]
        public void ShouldReturnSuccessWhenAddingAnListOfItemsToShoppingCart()
        {
            var shoppingCart = new ShoppingCart(Guid.NewGuid());

            shoppingCart.Items = listOfItems;
            Assert.True(shoppingCart.Nonconformities.Count == 0);
            Assert.Equal(true, shoppingCart.IsValid);
        }
    }
}