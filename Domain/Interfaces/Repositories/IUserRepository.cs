using System.Collections.Generic;
using SahibGameStore.Domain.Entities;

namespace SahibGameStore.Domain.Interfaces.Repositories
{
    public interface IUserRepository: IRepository<User>
    {
        //IEnumerable<User> SearchByName(string search);
    }
}