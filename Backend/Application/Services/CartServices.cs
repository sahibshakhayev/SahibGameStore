using Application.DTOS.Cart;
using AutoMapper;
using SahibGameStore.Application.DTOS.Cart;
using SahibGameStore.Application.Interfaces;
using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Exceptions;
using SahibGameStore.Domain.Interfaces.Repositories;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SahibGameStore.Application.Services
{
    public class CartServices : ICartServices
    {
        private readonly IUnitOfWork _unit;

        public CartServices(IUnitOfWork unit)
        {
            _unit = unit;
        }

        public async Task<ShoppingCartDto> GetCartAsync(Guid userId)
        {
            var cart = await _unit.Carts.GetByUserIdAsync(userId);
            return new ShoppingCartDto
            {
                Items = cart?.Items.Select(i => new CartItemDto
                {
                    GameId = i.GameId,
                    GameName = i.Game.Name,
                    GameImage = i.Game.ImageRelativePath,
                    Price = (decimal)i.Game.Price,
                    Quantity = i.Quantity,
                    Subtotal = (decimal)i.Game.Price * i.Quantity
                }).ToList() ?? new(),

                Total = cart?.Items.Sum(i => (decimal)i.Game.Price * i.Quantity) ?? 0
            } ;


        }


        public async Task AddAsync(Guid userId, Guid gameId, int qty)
        {
            var game = await _unit.Games.GetByIdAsync(gameId) ?? throw new ApplicationException("Game not found");
            if (game.AvailableQuantity < qty)
                throw new ApplicationException("Not enough stock");

            var cart = await _unit.Carts.GetByUserIdAsync(userId);
            if (cart == null)
            {
                cart = new ShoppingCart(userId);
                cart.AddItem(game, qty); 
                await _unit.Carts.AddAsync(cart);
            }
            else
            {
                cart.AddItem(game, qty); 
                _unit.Carts.Update(cart);
            }

            _unit.Games.Update(game);
            await _unit.SaveChangesAsync();
        }




        public async Task UpdateAsync(Guid userId, Guid gameId, int qty)
        {
            var game = await _unit.Games.GetByIdAsync(gameId) ?? throw new ApplicationException("Game not found");
            var cart = await _unit.Carts.GetByUserIdAsync(userId) ?? throw new ApplicationException("Cart not found");

            cart.UpdateItem(game, qty);
            _unit.Carts.Update(cart);
            _unit.Games.Update(game);
             await _unit.SaveChangesAsync();
        }

        public async Task RemoveAsync(Guid userId, Guid gameId)
        {
            var game = await _unit.Games.GetByIdAsync(gameId) ?? throw new ApplicationException("Game not found");
            var cart = await _unit.Carts.GetByUserIdAsync(userId);
            if (cart != null)
            {
                cart.RemoveItem(game);
                _unit.Carts.Update(cart);
                _unit.Games.Update(game);
                await  _unit.SaveChangesAsync();
            }
        }

        public async Task SubmitOrderAsync(Guid userId)
        {
            var cart = await _unit.Carts.GetByUserIdAsync(userId) ?? throw new ApplicationException("No cart");
            var games = await Task.WhenAll(cart.Items.Select(i => _unit.Games.GetByIdAsync(i.GameId)));

            cart.SubmitOrder(games);
            _unit.Carts.Update(cart);

            foreach (var game in games)
                _unit.Games.Update(game);

            _unit.SaveChanges();
        }
    }
}
