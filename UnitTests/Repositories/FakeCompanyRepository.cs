using System;
using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Interfaces.Repositories;
using SahibGameStore.Domain.ValueObjects;

namespace SahibGameStore.UnitTests.Repositories
{
    public class FakeCompanyRepository : FakeRepository<Company>, ICompanyRepository {
        public FakeCompanyRepository()
        {
            for (var i = 0; i < 10; i++)
            {
                base._entities.Add(new Company("Fake Company",DateTime.Now));
            }
        }
    }
}