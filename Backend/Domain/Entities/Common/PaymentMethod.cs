using SahibGameStore.Domain.Entities.Common;
using SahibGameStore.Domain.ValueObjects;
using System;

namespace SahibGameStore.Domain.Entities
{
    public enum EPaymentType
    {
        CreditCard,
        PayPal
    }

    public class PaymentMethod : BaseEntity
    {

        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public string Payer { get; private set; }
        public Email Email { get; private set; }
        public EPaymentType PaymentType { get; private set; }

        public string? CardHolderName { get; private set; }

        public long? CardNumber { get; private set; }



        protected PaymentMethod() { }
        public PaymentMethod(Guid userId, string payer, Email email, EPaymentType paymentType)
        {
            UserId = userId;
            Payer = payer;
            Email = email;
            PaymentType = paymentType;
        }

        public void SetCard(string cardHolderName, long? cardNumber)
        {

            CardHolderName = cardHolderName;    
            CardNumber = cardNumber;
        }

        public void Update(string payer, Email email) {

        
            Email = email;
            Payer = payer;
        
       
        
        }




    }

}
