using AutoMapper;
using Flunt.Notifications;
using SahibGameStore.Application.Commands;
using SahibGameStore.Application.DTOS.Common;
using SahibGameStore.Application.Interfaces;
using SahibGameStore.Application.ViewModels;
using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Entities.Common;
using SahibGameStore.Domain.Interfaces.Repositories;
using SahibGameStore.Domain.ValueObjects;
using System;
using System.Security.Cryptography;

namespace SahibGameStore.Application.Services
{
    public class OrderServices : IOrderServices
    {
        private readonly IUnitOfWork _unit;
        private readonly IMapper _mapper;

        public OrderServices(IUnitOfWork unit, IMapper mapper)
        {
            _unit = unit;
            _mapper = mapper;
        }

        public async Task<PagedResult<OrderDto>> GetAllAsync(int page, int pageSize, Guid? userId = null)
        {
            var (orders, totalCount) = await _unit.Orders.GetAllAsync(page, pageSize, userId);
            var mapped = _mapper.Map<IEnumerable<OrderDto>>(orders);

            return new PagedResult<OrderDto>(mapped, totalCount, page, pageSize);
        }

        public async Task<PagedResult<OrderDto>> GetByUserAsync(Guid userId, int page, int pageSize)
        {
            var (orders, totalCount) = await _unit.Orders.GetByUserAsync(userId, page, pageSize);

            var mapped = _mapper.Map<IEnumerable<OrderDto>>(orders);

            return new PagedResult<OrderDto>(mapped, totalCount, page, pageSize);



        }

        public async Task<OrderDto> GetByIdAsync(Guid orderId)
        {
            var order = await _unit.Orders.GetByIdAsync(orderId);
            return _mapper.Map<OrderDto>(order);
        }

        public async Task SubmitOrderAsync(Guid userId, CreateOrderDto dto)
        {
            var cart = await _unit.Carts.GetByUserIdAsync(userId)
                ?? throw new ApplicationException("Cart not found");

            if (cart.IsDeleted || !cart.Items.Any())
                throw new ApplicationException("Cart is empty or already submitted");

            var paymentMethod = await _unit.PaymentMethods.GetByIdAsync(dto.PaymentMethodId)
                ?? throw new ApplicationException("Invalid payment method");

            var total = cart.Items.Sum(i => i.Game.Price * i.Quantity);
            var paidDate = DateTime.UtcNow;
            var expireDate = paidDate.AddDays(30);

            Payment payment = paymentMethod.PaymentType switch
            {
                EPaymentType.CreditCard => new CreditCardPayment(
                    paidDate,
                    expireDate,
                    (decimal)total,
                    (decimal)total,
                    paymentMethod.Payer,
                    paymentMethod.Email,
                    paymentMethod.Payer,
                    "4111111111111111",
                    Guid.NewGuid().ToString().Substring(0, 8)
                ),
                EPaymentType.PayPal => new PayPalPayment(
                    Guid.NewGuid().ToString().Substring(0, 12),
                    paidDate,
                    expireDate,
                    (decimal)total,
                    (decimal)total,
                    paymentMethod.Payer,
                    paymentMethod.Email
                ),
                _ => throw new ApplicationException("Unsupported payment method")
            };

            // SAFE: Avoid concurrent EF access
            var games = new List<Game>();
            foreach (var item in cart.Items)
            {
                var game = await _unit.Games.GetByIdAsync(item.GameId);
                games.Add(game);
            }

            cart.SubmitOrder(games);

            var order = new Order(userId, cart, payment, dto.Address);
            await _unit.Orders.AddAsync(order);
            await _unit.SaveChangesAsync();
        }




        public async Task FinishPaypalOrder(Guid orderId)
        {
            var order = await _unit.Orders.GetByIdAsync(orderId);
            order.ChangeStatus(OrderStatus.Pending);
            await _unit.Orders.UpdateAsync(order);
            await _unit.SaveChangesAsync();
        }

        public async Task FinishCreditOrder(Guid orderId)
        {
            var order = await _unit.Orders.GetByIdAsync(orderId);
            order.ChangeStatus(OrderStatus.Pending);
            await _unit.Orders.UpdateAsync(order);
            await _unit.SaveChangesAsync();
        }

        public async Task EditOrderAsync(Guid orderId, string newAddress, OrderStatus newStatus)
        {
            var order = await _unit.Orders.GetByIdAsync(orderId);
            order.UpdateAddress(newAddress);
            order.ChangeStatus(newStatus);
            await _unit.Orders.UpdateAsync(order);
            await _unit.SaveChangesAsync();
        }

        public async Task CancelOrderAsync(Guid orderId, Guid userId, bool isAdmin = false)
        {
            var order = await _unit.Orders.GetByIdAsync(orderId);
            if (order.UserId != userId && !isAdmin) throw new UnauthorizedAccessException();

            order.Cancel();
            await _unit.Orders.UpdateAsync(order);
            await _unit.SaveChangesAsync();
        }
    }

}