using SahibGameStore.Application.DTOS.Cart;
using SahibGameStore.Application.Interfaces;
using SahibGameStore.Domain.Entities;
using System;
using AutoMapper;
using System.Threading.Tasks;
using SahibGameStore.Domain.Interfaces.Repositories;
using SahibGameStore.Domain.Exceptions;

namespace SahibGameStore.Application.Services
{
    public class CartServices : ICartServices
    {
        private readonly IUnitOfWork _unit;
        private readonly IMapper _mapper;
        public CartServices(IUnitOfWork unit, IMapper mapper)
        {
            _unit = unit;
            _mapper = mapper;
        }

        public async Task AddItemToCart(CartItemDTO item, Guid userId)
        {
            ShoppingCart CurrentCart = await _unit.Carts.GetCartByUserId(userId);

            if(CurrentCart is null)
            {
                CurrentCart = new ShoppingCart(userId);
                await _unit.Carts.CreateCart(CurrentCart);
            }

            var itemData = await _unit.Games.GetByIdAsync(item.ProductId);
           
            if(itemData is null) {

                throw new ApplicationException("Product Not Exist");
            
            }

            else if (itemData.AvailableQuantity == 0)
            {

                throw new ApplicationException("Product Out of Stock");

            }

            CurrentCart.AddItem(_mapper.Map<CartItem>(item));

            _unit.Carts.Update(CurrentCart);
        }


        public async Task RemoveItemFromCart(Guid itemId, CartDTO cart)
        {
            ShoppingCart CurrentCart = await _unit.Carts.GetCartByUserId(cart.UserId);

            if (CurrentCart is null)
            {
                throw new ApplicationException("Cart Not Found");
            }

            foreach (CartItem item in CurrentCart.ListOfItems)
            {
                if (item.ProductId == itemId)
                {
                    CurrentCart.RemoveItem(_mapper.Map<CartItem>(item));
                    _unit.Carts.Update(CurrentCart);
                    break;

                }
                throw new ApplicationException("Product Not Found");


            }
            

        }
    }
}
