using Application.DTOS.Common;
using Application.DTOS.Games;
using SahibGameStore.Application.DTOS.Common;
using SahibGameStore.Application.DTOS.Games;
using SahibGameStore.Application.ViewModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SahibGameStore.Application.Interfaces
{
    public interface IGameServices
    {
        Task<IEnumerable<GameListViewModel>> GetAllGames();
        Task<PagedResult<GameListViewModel>> GetAllGamesAsync(GameQueryDto queryParams);
        Task<IEnumerable<dynamic>> GetAllGamesWithDevelopersAsync();
        Task<GameViewModel> GetGameById(Guid game);
        Task<IEnumerable<GameListViewModel>> GetGamesByGenre(Guid genreId);
        Guid InsertGame(AddOrUpdateGameDTO game);
        void UpdateGame(AddOrUpdateGameDTO game);
        void DeleteGame(Guid id);
        Task UpdateThumbImage(Guid id, string path);
        Task UpdateCoverImage(Guid id, string path);

        Task<IEnumerable<GameListViewModel>> GetBestRatedGames();
        Task<IEnumerable<GameListViewModel>> GetBestSellerGames();
        Task AddOrUpdateOverview(AddOrUpdateGameOverviewDTO model);
        Task<dynamic> GetOverview(Guid id);
    }
}