using SahibGameStore.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOS.Common
{
    public class PaymentMethodDto
    {
        public Guid Id { get; set; }
        public string Alias { get; set; }
        public string Email { get; set; }
        public string? CardHolderName { get; set; }
        public string? LastFourDigits { get; set; }
        public EPaymentType Type { get; set; }
    }
}
