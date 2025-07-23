using System;
using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.ValueObjects;
using Xunit;

namespace SahibGameStore.UnitTests.Entities
{
    public class PaymentsTests
    {
        [Fact]
        public void ShouldReturnErrorWhenPaymentDayIsExpired() {
            var payment = new CreditCardPayment(
               DateTime.Now,
               DateTime.Now.AddDays(-1),
               6000,
               6000,
               "Sahib Shakhayev",
               new Email("sahib@email.az"),
               "Sahib Shakhayev",
               "123456789",
               Guid.NewGuid().ToString().Replace("-", ""));
            Assert.True(payment.Nonconformities.Count == 1);
            Assert.Equal(payment.Nonconformities[0].Property, "payment.expireDate");
            Assert.Equal(false, payment.IsValid);
        }

        [Fact]
        public void ShouldReturnErrorWhenTotalPaidIsLessThanTotalValue() {
            var payment = new CreditCardPayment(
               DateTime.Now,
               DateTime.Now.AddDays(1),
               6000,
               5000,
               "Sahib Shakhayev",
               new Email("sahib@email.az"),
               "Sahib Shakhayev",
               "123456789",
               Guid.NewGuid().ToString().Replace("-", ""));
            Assert.True(payment.Nonconformities.Count == 1);
            Assert.Equal(payment.Nonconformities[0].Property, "payment.totalPaid");
            Assert.Equal(false, payment.IsValid);
        }
        
        [Fact]
        public void ShouldReturnErroWhenPayPalPaymentTransactionCodeIsNullOrEmpty()
        {
            var payment = new PayPalPayment(
                string.Empty,
                DateTime.Now,
                DateTime.Now.AddDays(1),
                6000,
                6000,
                "Sahib Shakhayev",
                new Email("sahib@email.az")
            );

            Assert.True(payment.Nonconformities.Count == 1);
            Assert.Equal(payment.Nonconformities[0].Property, "payment.transactionCode");
            Assert.Equal(false,payment.IsValid);
        }
    }
}