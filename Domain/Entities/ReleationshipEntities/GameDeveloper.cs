using System; 

namespace SahibGameStore.Domain.Entities.ReleationshipEntities
{
    public class GameDeveloper
    {
        public Guid GameId { get; set; } 
        public Game Game { get; set; }
        public Guid DeveloperId { get; set; }
        public Company Developer { get; set; }     
    }
}
