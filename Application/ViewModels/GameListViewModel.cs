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
    public class GameListViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public DateTime ReleaseDate { get; set; }
        public double? UsersScore { get; set; }
        public string ShortDescription { get; set; }
        public string ImageRelativePath { get; set; }
        public string CoverImageRelativePath { get; set; }
    }
}