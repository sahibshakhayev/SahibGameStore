using SahibGameStore.Domain.Entities.Common;
using SahibGameStore.Domain.ValueObjects;
using System;


namespace SahibGameStore.Domain.Entities
{
    public class CreditCardPayment: Payment
    {
        protected CreditCardPayment() { }
       
            public string CardHolderName { get; private set; }
            public string CardNumber { get; private set; }
            public string LastTransactionCode { get; private set; }
       

        public CreditCardPayment(DateTime paidDate, DateTime expireDate, decimal total, decimal totalPaid, string payer, Email email, string cardHolderName, string cardNumber, string lastTransactionCode)
                : base(paidDate, expireDate, total, totalPaid, payer, email)
            {
                CardHolderName = cardHolderName;
                CardNumber = cardNumber;
                LastTransactionCode = lastTransactionCode;
            
        }


      
    }
}
