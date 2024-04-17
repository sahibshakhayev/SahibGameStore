using SahibGameStore.Application.DTOS.Cart;
using SahibGameStore.Application.Interfaces;
using SahibGameStore.Domain.Entities;
using System;
using AutoMapper;
using System.Threading.Tasks;
using SahibGameStore.Domain.Interfaces.Repositories;
using SahibGameStore.Domain.Exceptions;
using SahibGameStore.Domain.Entities.Common;
using System.Data.Entity.Infrastructure;
using Serilog;
using System.Data;

namespace SahibGameStore.Application.Services
{
    public class CartServices : ICartServices
    {
        private readonly IUnitOfWork _unit;
        private readonly IMapper _mapper;
        private readonly ILogger _logger;
        public CartServices(IUnitOfWork unit, IMapper mapper, ILogger logger)
        {
            _unit = unit;
            _mapper = mapper;
            _logger = logger;
     
        }



        public async Task<ShoppingCart> GetUserCart(Guid userId)
        {
          var currentCart = _unit.Carts.GetActiveShoppingCartByUser(userId);

            if (currentCart is null)
            {
                throw new ApplicationException("No Cart!");
            }

            return currentCart;


        }

        public async Task AddItemToCart(CartItemDTO item, Guid userId)
        {
            var currentCart = _unit.Carts.GetActiveShoppingCartByUser(userId);

            if (currentCart is null)
            {
                currentCart = new ShoppingCart(userId);
                await _unit.Carts.CreateCart(currentCart);
            }

            var itemData = await _unit.Games.GetByIdAsync(item.ProductId);

            if (itemData is null)
            {
                throw new ApplicationException("Product Not Exist");
            }

            if (itemData.AvailableQuantity == 0)
            {
                throw new ApplicationException("Product Out of Stock");
            }

            

            try
            {
               await _unit.Carts.AddItemtoCart(currentCart, itemData);
            }
            catch (Exception ex)
            {
                _logger.Error("Error when updating: {Message}", ex.Message);

             
                
            }

        }


        public async Task RemoveItemFromCart(CartItemDTO item, Guid userId)
        {
            ShoppingCart CurrentCart = _unit.Carts.GetActiveShoppingCartByUser(userId);

            if (CurrentCart is null)
            {
                throw new ApplicationException("Cart Not Found");
            }



            CartItem itemData = CurrentCart._listOfItems.FirstOrDefault(i => i.ProductId == item.ProductId);

            if (itemData is null)
            {
                throw new ApplicationException("Item Not Exist in Cart");
            }


           
            CurrentCart._listOfItems.Remove(itemData);
            

            await _unit.Carts.RemoveItemFrom(CurrentCart,itemData);

        }

        public async Task SetItemQuantity(CartItemDTO item, Guid UserId, int newQuantity)
        {
            ShoppingCart CurrentCart = _unit.Carts.GetActiveShoppingCartByUser(UserId);

            if (CurrentCart is null)
            {
                throw new ApplicationException("Cart Not Found");
            }

            if (newQuantity <= 0) {


                throw new ApplicationException("Quantity cannot be zero or below!");
            
            
            }


            CartItem itemData = CurrentCart._listOfItems.FirstOrDefault(i => i.ProductId == item.ProductId);

            if (itemData is null)
            {
                throw new ApplicationException("Item Not Exist in Cart");
            }


            CurrentCart.UpdateItemQuantity(itemData, newQuantity);

            itemData.ChangeQuantityTo(newQuantity);

            await _unit.Carts.UpdateItemQuantity(CurrentCart, itemData);


        }




    }
}
