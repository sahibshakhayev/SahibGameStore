using System.Linq;
using SahibGameStore.Domain.Entities;
using SahibGameStore.UnitTests.Repositories;
using Xunit;

namespace SahibGameStore.UnitTests.Entities
{
    public class CartItemTests
    {
        private FakeGameRepository _repository;

        public CartItemTests()
        {
            
            _repository = new FakeGameRepository();
        }

        [Fact]
        public void ShouldReturnErrorWhenQuantityIsBelowZero()
        {
            Game fakeProduct = _repository._entities.FirstOrDefault();
            var cartItem = new CartItem(fakeProduct.Id, -1) { Game = fakeProduct };

            Assert.True(cartItem.Quantity < 0);
        }

        [Fact]
        public void ShouldCreateCartItemWithValidData()
        {
            Game fakeProduct = _repository._entities.FirstOrDefault();
            var cartItem = new CartItem(fakeProduct.Id, 1) { Game = fakeProduct };

            Assert.Equal(fakeProduct.Id, cartItem.GameId);
            Assert.Equal(1, cartItem.Quantity);
            Assert.Equal(fakeProduct, cartItem.Game);
        }
    }
}
