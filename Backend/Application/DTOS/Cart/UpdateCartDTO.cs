﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOS.Cart
{
    public class AddorUpdateCartItemDto
    {
        public Guid GameId { get; set; }
        public int Quantity { get; set; }
    }
}
