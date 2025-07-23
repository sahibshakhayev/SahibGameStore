using Application.DTOS.Common;
using Application.Interfaces;
using AutoMapper;
using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Interfaces.Repositories;
using SahibGameStore.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SahibGameStore.Application.Services
{
    public class PaymentMethodServices : IPaymentMethodServices
    {
        private readonly IUnitOfWork _unit;
        private readonly IMapper _mapper;

        public PaymentMethodServices(IUnitOfWork unit, IMapper mapper)
        {
            _unit = unit;
            _mapper = mapper;
        }



        public async Task<IEnumerable<PaymentMethod>> GetAllByUser(Guid userId)
        {
            return await _unit.PaymentMethods.GetByUserIdAsync(userId);
        }

        public async Task<PaymentMethod> GetByIdAsync(Guid id)
        {
            return await _unit.PaymentMethods.GetByIdAsync(id);
        }

        public async Task AddAsync(Guid userId, AddorUpdatePaymentMethodDto dto)
        {

            try
            {
                var email = new Email(dto.Email);
                var method = new PaymentMethod(userId, dto.Payer, email, dto.Type);

                if (dto.Type == EPaymentType.CreditCard)
                {
                    method.SetCard(dto.CardHolderName!, dto.CardNumber);
                }

                _unit.PaymentMethods.Add(method);
                await _unit.SaveChangesAsync();
            }

            catch (Exception ex) { 
            
                Task.FromException(ex);
            
            }
        }

        public async Task UpdateAsync(Guid id, AddorUpdatePaymentMethodDto dto)
        {
            try
            {

                var method = await _unit.PaymentMethods.GetByIdAsync(id);
                var email = new Email(dto.Email);

                method.Update(dto.Payer, email);

                if (dto.Type == EPaymentType.CreditCard)
                {
                    method.SetCard(dto.Payer, dto.CardNumber);
                }

                _unit.PaymentMethods.Update(method);
                await _unit.SaveChangesAsync();

            }
            catch (Exception ex) { 
            Task.FromException(ex);
            
            }
        }

        public async Task DeleteAsync(Guid id)
        {
            _unit.PaymentMethods.Remove(id);
            await _unit.SaveChangesAsync();
        }


    }
}
