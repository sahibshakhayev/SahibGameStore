using SahibGameStore.Application.Commands;
using SahibGameStore.Application.DTOS.Common;
using SahibGameStore.Application.ViewModels;
using SahibGameStore.Domain.Entities;
using System;

namespace SahibGameStore.Application.Interfaces
{
    public interface IOrderServices
    {
        Task<PagedResult<OrderDto>> GetAllAsync(int page, int pageSize, Guid? userId = null);
        Task<PagedResult<OrderDto>> GetByUserAsync(Guid userId, int page, int pageSize);
        Task<OrderDto> GetByIdAsync(Guid orderId);
        Task SubmitOrderAsync(Guid userId, CreateOrderDto dto);
        Task FinishPaypalOrder(Guid orderId);
        Task FinishCreditOrder(Guid orderId);
        Task EditOrderAsync(Guid orderId, string newAddress, OrderStatus newStatus);
        Task CancelOrderAsync(Guid orderId, Guid userId, bool isAdmin = false);
    }

}