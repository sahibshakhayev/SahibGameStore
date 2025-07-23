using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Interfaces.Repositories;

namespace SahibGameStore.UnitTests.Repositories {
    public class FakePlatformRepository: FakeRepository<Platform>, IPlatformRepository
    {
        public FakePlatformRepository()
        {
            for (int i = 0; i < 10; i++)
            {
                base._entities.Add(new Platform("Fake Console"));
            }    
        }
    }
}