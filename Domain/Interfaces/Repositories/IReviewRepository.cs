using SahibGameStore.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SahibGameStore.Domain.Interfaces.Repositories
{
    public interface IReviewRepository : IRepository<Review>
    {
        IEnumerable<Review> GetReviewByProductId(Guid productId);
        IEnumerable<Review> GetReviewByUserId(Guid userId);
    }
}
