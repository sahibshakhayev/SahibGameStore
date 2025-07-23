using System;
using System.Collections.Generic;

namespace SahibGameStore.Application.DTOS.Cart
{
    public class ShoppingCartDto
    {
        public List<CartItemDto> Items { get; set; }

        public decimal Total { get; set; }
    }
}
