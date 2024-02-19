using System;
using System.Collections.Generic;
using SahibGameStore.Application.DTOS.Reviews;
using SahibGameStore.Application.ViewModels;

namespace SahibGameStore.Application.Interfaces
{
    public interface IReviewServices {
        IEnumerable<ReviewListViewModel> GetReviewByProductId(Guid productId);
        IEnumerable<ReviewListViewModel> GetReviewByUserId(Guid userId);
        Guid Save(AddOrUpdateReviewDTO command);
        void Update(AddOrUpdateReviewDTO command);
        void Delete(Guid id);
    }
}