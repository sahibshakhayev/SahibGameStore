using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SahibGameStore.Application.DTOS.Games
{
    public class GameQueryDto
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;

        public string? SearchTerm { get; set; }
        public string SortBy { get; set; } = "Name";
        public bool IsDescending { get; set; } = false;

        public Guid? GenreId { get; set; }
        public Guid? DeveloperId { get; set; }

        public Guid? PlatformId { get; set; }
    }

}
