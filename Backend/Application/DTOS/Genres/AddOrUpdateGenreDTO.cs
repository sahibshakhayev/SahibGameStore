using System;

namespace SahibGameStore.Application.DTOS.Genres
{
    public class AddOrUpdateGenreDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
    }
}