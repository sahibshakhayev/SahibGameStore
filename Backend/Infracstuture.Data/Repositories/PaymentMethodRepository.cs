using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Interfaces.Repositories;
using SahibGameStore.Infracstuture.Data.Context;
using SahibGameStore.Infracstuture.Data.Repositories.Common;
using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SahibGameStore.Infracstuture.Data.Repositories
{
    public class PaymentMethodRepository : Repository<PaymentMethod>, IPaymentMethodRepository
    {
        private SahibGameStoreContext _db;
        public PaymentMethodRepository(SahibGameStoreContext db) : base(db)
        {
            _db = db;
        }

        public async Task<IEnumerable<PaymentMethod>> GetByUserIdAsync(Guid userId)
        {
            return await _db.PaymentMethods.Where(pm => pm.UserId == userId && pm.Active).ToListAsync();
        }
    }
}
