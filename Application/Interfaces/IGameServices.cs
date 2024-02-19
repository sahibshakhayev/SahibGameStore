using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SahibGameStore.Application.DTOS.Games;
using SahibGameStore.Application.ViewModels;

namespace SahibGameStore.Application.Interfaces
{
    public interface IGameServices
    {
        Task<IEnumerable<GameListViewModel>> GetAllGames();
        Task<IEnumerable<dynamic>> GetAllGamesWithDevelopersAsync();
        Task<GameViewModel> GetGameById(Guid game);
        Task<IEnumerable<GameListViewModel>> GetGamesByGenre(Guid genreId);
        Guid InsertGame(AddOrUpdateGameDTO game);
        void UpdateGame(AddOrUpdateGameDTO game);
        void DeleteGame(Guid id);
        Task UpdateThumbImage(Guid id, string path);

        Task<IEnumerable<GameListViewModel>> GetBestRatedGames();
        Task<IEnumerable<GameListViewModel>> GetBestSellerGames();
        Task AddOrUpdateOverview(AddOrUpdateGameOverviewDTO model);
        Task<dynamic> GetOverview(Guid id);
    }
}