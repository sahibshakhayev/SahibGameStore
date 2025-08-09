using Microsoft.AspNetCore.Http;
using System;

namespace SahibGameStore.Application.DTOS.Games
{
    public class AddOrUpdateGameOverviewFormDTO
    {
        public Guid GameId { get; set; }
        public IFormFile? VideoFile { get; set; }
        public string Html { get; set; }
    }
}
