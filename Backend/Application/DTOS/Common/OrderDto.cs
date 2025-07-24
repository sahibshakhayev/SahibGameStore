using SahibGameStore.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SahibGameStore.Application.DTOS.Common
{
    public class CreateOrderDto
    {
        public Guid PaymentMethodId { get; set; }
        public string Address { get; set; }
    }


    public class OrderDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }

        public DateTime CreatedDate { get; set; }
        public OrderStatus Status { get; set; }

       

        public string Address { get; set; }
        public List<CartItemDto> Items { get; set; }
        public decimal Total { get; set; }
    }

}
