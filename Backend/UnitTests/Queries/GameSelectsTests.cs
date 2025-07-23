using SahibGameStore.Domain.Entities;
using SahibGameStore.Infracstuture.Data.Context;
using SahibGameStore.Infracstuture.Data.Repositories;
using SahibGameStore.UnitTests.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using Xunit;

namespace SahibGameStore.UnitTests.Queries
{
    public class GameSelectsTests
    {
        private FakeGameRepository _repository;

        public GameSelectsTests()
        {
            
            _repository = new FakeGameRepository();
        }

        [Fact]
        public void ShoulReturnGamesList()
        {
            var list = _repository.GetAllAsync().GetAwaiter().GetResult();
            var count = list.Count();
            Assert.True(count == 10);
        }
    }
}

