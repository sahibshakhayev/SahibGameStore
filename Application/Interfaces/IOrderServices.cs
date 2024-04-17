using System;
using SahibGameStore.Application.Commands;
using SahibGameStore.Application.ViewModels;

namespace SahibGameStore.Application.Interfaces
{
    public interface IOrderServices
    {
        Task<IEnumerable<OrderListViewModel>> GetAllOrders();


        Task<IEnumerable<OrderListViewModel>> GetAllOrdersbyUser(Guid userId);


        CommandResult CancelOrder(Guid orderId, Guid userId);
        CommandResult FinishCreditCardOrder (FinishCreditCardOrderCommand order, Guid UserId);
        CommandResult FinishPayPalOrder (FinishPayPalOrderCommand order, Guid UserId);
    }
}