using Application.DTOS.Common;
using SahibGameStore.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface IPaymentMethodServices
    {
        Task<IEnumerable<PaymentMethod>> GetAllByUser(Guid userId);
        Task<PaymentMethod> GetByIdAsync(Guid id);
        Task AddAsync(Guid userId, AddorUpdatePaymentMethodDto dto);
        Task UpdateAsync(Guid id, AddorUpdatePaymentMethodDto dto);
        Task DeleteAsync(Guid id);

    }

}
