using System;
using SahibGameStore.Application.Commands;

namespace SahibGameStore.Application.Interfaces
{
    public interface IOrderServices
    {
        CommandResult FinishCreditCardOrder (FinishCreditCardOrderCommand order, Guid UserId);
        CommandResult FinishPayPalOrder (FinishPayPalOrderCommand order, Guid UserId);
    }
}