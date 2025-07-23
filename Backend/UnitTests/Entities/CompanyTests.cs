using System;
using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.ValueObjects;
using Xunit;

namespace SahibGameStore.UnitTests.Entities {
    public class CompanyTests {
        
        [Fact]
        public void ShouldReturnErrorWhenFantasyNameIsNull() {
            var fakeComapany = new Company("",DateTime.Now);
            Assert.Equal(false, fakeComapany.IsValid);
            Assert.Equal(true, fakeComapany.IsInvalid);
        }
    }
}