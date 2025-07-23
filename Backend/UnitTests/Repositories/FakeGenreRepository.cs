using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Interfaces.Repositories;
using SahibGameStore.Infracstuture.Data.Context;

namespace SahibGameStore.UnitTests.Repositories {
    public class FakeGenreRepository: FakeRepository<Genre>, IGenreRepository
    {
        public FakeGenreRepository()
        {
            for (int i = 0; i < 10; i++)
            {
                base._entities.Add(new Genre("Fake Genre"));
            }
        }
    }
}
