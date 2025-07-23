using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Entities.ReleationshipEntities;
using System.Linq;
using System.Runtime.Serialization;
using SahibGameStore.Application.DTOS.Games;

namespace SahibGameStore.Application.ViewModels
{
    public class GameViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public DateTime ReleaseDate { get; set; }
        public double UserScore { get; set; }
        public double Price { get; set; }

        public int availableQuantity { get; set; }
        public string Description { get; set; }
        public string ShortDescription { get; set; }
        public string ImageRelativePath { get; set; }
        public string CoverImageRelativePath { get; set; }

        private ICollection<GameDeveloper> GameDevelopers { get; set; }
        private ICollection<GamePlatform> GamePlatforms { get; set; }
        private ICollection<GameGenre> GameGenres { get; set; }
        private ICollection<GamePublisher> GamePublishers { get; set; }

        public IEnumerable<dynamic> Developers
        {
            get
            {
                return GameDevelopers.Select(e => new
                {
                    Id = e.Developer.Id,
                    Name = e.Developer.Name,
                    Foundingdate = e.Developer.Founded,
                    LogoPath = e.Developer.LogoPath
                });
            }
        }
        public IEnumerable<dynamic> Genres
        {
            get
            {
                return GameGenres.Select(e => new
                {
                    Id = e.Genre.Id,
                    Name = e.Genre.Name,
                    Description = e.Genre.Description
                });
            }
        }
        public IEnumerable<dynamic> Publishers
        {
            get
            {
                return GamePublishers.Select(e => new
                {
                    Id = e.Publisher.Id,
                    Name = e.Publisher.Name,
                    Foundingdate = e.Publisher.Founded,
                    LogoPath = e.Publisher.LogoPath
                });
            }
        }
        public IEnumerable<dynamic> Platforms
        {
            get
            {
                return GamePlatforms.Select(e => new
                {
                    Id = e.Platform.Id,
                    Name = e.Platform.Name
                });
            }
        }
    }
}