using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SahibGameStore.Infracstuture.Data.Context;
using SahibGameStore.Infracstuture.Data.Repositories.Common;
using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Interfaces.Repositories;

namespace SahibGameStore.Infracstuture.Data.Repositories
{
    public class ReviewRepository : Repository<Review>, IReviewRepository
    {
        private SahibGameStoreContext _db;
        public ReviewRepository(SahibGameStoreContext db) : base(db)
        {
            _db = db;
        }

        public IEnumerable<Review> GetReviewByProductId(Guid productId)
        {
            return from review in _db.Reviews
                   where review.ProductId == productId
                   select review;
        }

        public IEnumerable<Review> GetReviewByUserId(Guid userId)
        {
            return from review in _db.Reviews
                   where review.UserId == userId
                   select review;
        }
    }
}