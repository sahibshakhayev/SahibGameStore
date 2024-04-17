using SahibGameStore.Domain.Entities.Common;
using SahibGameStore.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SahibGameStore.Application.ViewModels
{
    public class OrderListViewModel
    {

        public Guid Id { get; set; }    

        public Guid UserId { get; set; }

        public Payment FormOfPayment { get; private set; }
        public ShoppingCart ShoppingCart { get; private set; }


    }
}
