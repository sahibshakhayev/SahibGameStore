using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SahibGameStore.Application.DTOS.Games
{
    public class FavoriteGameViewDTO
    {
        public Guid GameId { get; set; }
        public string Name { get; set; } = null!;
        public string CoverImageUrl { get; set; } = null!;
    }
}
