using SahibGameStore.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOS.Common
{
    public class AddorUpdatePaymentMethodDto
    {
        public string Payer { get; set; }
        public string Email { get; set; }
        public EPaymentType Type { get; set; }

        public string? CardHolderName { get; set; }

        public long? CardNumber { get; set; } 
    }
}
