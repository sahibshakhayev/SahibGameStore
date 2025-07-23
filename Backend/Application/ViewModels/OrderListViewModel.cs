﻿using SahibGameStore.Domain.Entities.Common;
using SahibGameStore.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SahibGameStore.Domain.Entities.ReleationshipEntities;

namespace SahibGameStore.Application.ViewModels
{
    public class OrderListViewModel
    {

        public Guid Id { get; set; }    

        public Guid UserId { get; set; }

        public Payment FormOfPayment { get; private set; }
        protected ShoppingCart ShoppingCart { get; private set; }

        public IEnumerable<dynamic> Cart
        {
            get
            {
                return ShoppingCart.Items.Select(e => new
                {
                    Id = e.Game.Id,
                    Name = e.Game.Name,
                    Quantity = e.Quantity,
                }) ;
            }
        }






    }
}
