using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SahibGameStore.Application.DTOS.Genres;
using SahibGameStore.Application.ViewModels;

namespace SahibGameStore.Application.Interfaces
{
    public interface IGenreServices
    {
        Task<IEnumerable<GenreViewModel>> GetAllGenres();
        Task<GenreViewModel> GetGenreById(Guid game);
        void InsertGenre(AddOrUpdateGenreDTO game);
        void UpdateGenre(AddOrUpdateGenreDTO game);
        void DeleteGenre(Guid id);
    }
}