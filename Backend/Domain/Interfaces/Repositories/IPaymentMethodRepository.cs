using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SahibGameStore.Domain.Interfaces.Repositories
{
    public interface IPaymentMethodRepository : IRepository<PaymentMethod>
    {
        Task<IEnumerable<PaymentMethod>> GetByUserIdAsync(Guid userId);
    }

}
