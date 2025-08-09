using SahibGameStore.Domain.Entities.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SahibGameStore.Domain.Entities
{
    
    public class Favorite:BaseEntity
    {

        protected Favorite() { }


        public Favorite(Guid userId, Game game)
        {
            UserId = userId;
            Game = game;
        }

        public Guid UserId { get; set; }
        public Guid GameId { get; set; }

        public Game Game { get; set; } = null!;
    }

}
