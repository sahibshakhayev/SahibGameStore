using System;

namespace SahibGameStore.Domain.Entities.ReleationshipEntities
{
    public class GamePlatform
    {
        public Guid GameId { get; set; }
        public Game Game { get; set; }

        public Guid PlatformId { get; set; }
        public Platform Platform { get; set; }
    }
}
