using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using SahibGameStore.Domain.Entities.ReleationshipEntities;

namespace SahibGameStore.Application.DTOS.Games
{
    public class AddOrUpdateGameDTO
    {
        public Guid Id { get; set; }

        [Required]
        public string Name { get; set; }

        public DateTime ReleaseDate { get; set; }

        [Required]
        public string Description { get; set; }

        public string ShortDescription { get; set; }

        [Required]
        public double Price { get; set; }

        [Required]
        public int AvailableQuantity { get; set; }

        [Required(ErrorMessage = "Genres required.")]
        public ICollection<GenreRefDto> GameGenres { get; set; }

        [Required(ErrorMessage = "Platforms required.")]
        public ICollection<PlatformRefDto> GamePlatforms { get; set; }

        [Required(ErrorMessage = "Developers required.")]
        public ICollection<DeveloperRefDto> GameDevelopers { get; set; }

        public ICollection<PublisherRefDto> GamePublishers { get; set; }
    }

    public class GenreRefDto
    {
        public Guid GenreId { get; set; }
    }

    public class PlatformRefDto
    {
        public Guid PlatformId { get; set; }
    }

    public class DeveloperRefDto
    {
        public Guid DeveloperId { get; set; }
    }

    public class PublisherRefDto
    {
        public Guid PublisherId { get; set; }
    }


}