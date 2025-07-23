
using System.Linq;
using SahibGameStore.UnitTests.Repositories;
using Xunit;

namespace SahibGameStore.UnitTests.Queries {
    public class CompanySelectTests {
        private FakeCompanyRepository _repository;

        public CompanySelectTests()
        {
            
            _repository = new FakeCompanyRepository();
        }

        [Fact]
        public void ShoulReturnCompaniesList()
        {
            var list = _repository.GetAllAsync().GetAwaiter().GetResult();
            var count = list.Count();
            Assert.True(count == 10);
        }
    }
}