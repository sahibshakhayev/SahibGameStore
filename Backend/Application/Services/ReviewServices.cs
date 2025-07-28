using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using SahibGameStore.Application.Commands;
using SahibGameStore.Application.DTOS.Reviews;
using SahibGameStore.Application.Interfaces;
using SahibGameStore.Application.ViewModels;
using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Interfaces.Repositories;

namespace SahibGameStore.Application.Services
{
    public class ReviewServices : IReviewServices
    {
        private IUnitOfWork _unit;
        private IMapper _mapper;

        public ReviewServices(
            IUnitOfWork unit,
            IMapper mapper)
        {
            _unit = unit;
            _mapper = mapper;
        }

        public IEnumerable<ReviewListViewModel> GetReviewByProductId(Guid productId) {
            return _mapper.Map<IEnumerable<ReviewListViewModel>>(_unit.Reviews.GetReviewByProductId(productId));
        }

        public IEnumerable<ReviewListViewModel> GetReviewByUserId(Guid userId) {
            return _mapper.Map<IEnumerable<ReviewListViewModel>>(_unit.Reviews.GetReviewByUserId(userId));
        }

        public void Delete(Guid id)
        {
            _unit.Reviews.Remove(id);
        }

        public Guid Save(AddOrUpdateReviewDTO command, Guid userId)
        {
            Review review = new Review(userId, command.ProductId, command.Rating, command.Considerations);






            return _unit.Reviews.Add(review);
        }

        public void Update(AddOrUpdateReviewDTO command)
        {
            _unit.Reviews.Update(_mapper.Map<Review>(command));
        }
    }
}