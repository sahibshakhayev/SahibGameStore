using System;
using System.ComponentModel.DataAnnotations;

namespace SahibGameStore.Application.DTOS.Reviews
{
    public class AddOrUpdateReviewDTO
    {
        public string Considerations { get; set; }

        [Range(0.0, 5.0, ErrorMessage = "Rating must be between 0 and 5")]
        public float Rating { get; set; }
        public Guid ProductId { get; set; }
    }
}