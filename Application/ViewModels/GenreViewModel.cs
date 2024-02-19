using System;
using System.Collections.Generic;
using System.Linq;
using SahibGameStore.Application.DTOS.Genres;
using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Entities.ReleationshipEntities;

namespace SahibGameStore.Application.ViewModels
{
    public class GenreViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        private ICollection<GameGenre> GameGenres { get; set; }

        public IEnumerable<dynamic> GamesOfThisGenre
        {
            get
            {
                return GameGenres.Select(e => new
                {
                    Id = e.Game.Id,
                    Name = e.Game.Name,
                });
            }
        }
    }
}