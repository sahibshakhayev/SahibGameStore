using SahibGameStore.Domain.Entities.Common;
using SahibGameStore.Domain.Entities.ReleationshipEntities;
using SahibGameStore.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace SahibGameStore.Domain.Entities
{
    public class Genre : BaseEntity
    {
        protected Genre () { }
        public Genre(string name)
        {
            Name = name;
            if (String.IsNullOrEmpty(Name))
                AddNonconformity(new Nonconformity("genre.name", "Genre Name cannot be null."));
        }

        public string Name { get; private set; }
        public string Description { get; private set; } = string.Empty;
        public ICollection<GameGenre> GameGenres { get; private set; }

        public void ChangeName(string name) {
            Name = name;
        }
    }
}
