using SahibGameStore.Domain.Entities;
using Xunit;

namespace SahibGameStore.UnitTests.Entities
{
    public class GenreTests
    {
        [Fact]
        public void ShouldReturnErrorWhenNameIsEmpty()
        {
            var fakeGenre = new Genre(null);
            Assert.Equal(false, fakeGenre.IsValid);
        }
    }
}