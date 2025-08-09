using Application.DTOS.Common;
using AutoMapper;
using SahibGameStore.Application.DTOS.Common;
using SahibGameStore.Application.DTOS.Games;
using SahibGameStore.Application.Interfaces;
using SahibGameStore.Application.ViewModels;
using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SahibGameStore.Application.Services
{
    public class GameServices : IGameServices
    {
        private IUnitOfWork _unit;
        private IMapper _mapper;
        public GameServices(IUnitOfWork unit, IMapper mapper)
        {
            _unit = unit;
            _mapper = mapper;
        }

        public async Task<IEnumerable<dynamic>> GetAllGamesWithDevelopersAsync()
        {
            return await _unit.Games.GetAllGamesWithDevelopersAsync();
        }

        public async Task<IEnumerable<GameListViewModel>> GetAllGames()
        {
            return _mapper.Map<IEnumerable<GameListViewModel>>(await _unit.Games.GetAllAsync());
        }




        public async Task<GameViewModel> GetGameById(Guid gameId)
        {
            return _mapper.Map<GameViewModel>(await _unit.Games.GetByIdAsync(gameId));
        }

        public async Task<IEnumerable<GameListViewModel>> GetGamesByGenre(Guid genreId)
        {
            return _mapper.Map<IEnumerable<GameListViewModel>>(await _unit.Games.GetAllGamesFromThisGenreAsync(genreId));
        }

        public Guid InsertGame(AddOrUpdateGameDTO gamevm)
        {
            return _unit.Games.Add(_mapper.Map<Game>(gamevm));
        }
        public void UpdateGame(AddOrUpdateGameDTO gamevm)
        {
            _unit.Games.Update(_mapper.Map<Game>(gamevm));
        }
        public void DeleteGame(Guid id)
        {
            _unit.Games.Remove(id);
        }

        public async Task<IEnumerable<GameListViewModel>> GetBestRatedGames()
        {
            return _mapper.Map<IEnumerable<GameListViewModel>>(await _unit.Games.GetBestRatedGamesAsync());
        }

        public async Task<IEnumerable<GameListViewModel>> GetBestSellerGames()
        {
            return _mapper.Map<IEnumerable<GameListViewModel>>(await _unit.Games.GetBestSellerGamesAsync());
        }

        public async Task UpdateThumbImage(Guid id, string path)
        {
            var game = await _unit.Games.GetByIdAsync(id);
            game.ChangeThumbImagePath(path);
            _unit.Games.Update(game);
        }

        public async Task AddOrUpdateOverview(AddOrUpdateGameOverviewDTO model)
        {
            await _unit.Games.AddOrUpdateOverview(_mapper.Map<GameOverview>(model));
        }

        public async Task<dynamic> GetOverview(Guid id)
        {
            return await _unit.Games.GetOverview(id);
        }

        public async Task<PagedResult<GameListViewModel>> GetAllGamesAsync(global::SahibGameStore.Application.DTOS.Games.GameQueryDto queryDto)
        {

            var queryParams = new GameQueryParameters
            {
                PageNumber = queryDto.PageNumber,
                PageSize = queryDto.PageSize,
                SearchTerm = queryDto.SearchTerm,
                SortBy = queryDto.SortBy,
                IsDescending = queryDto.IsDescending,
                GenreId = queryDto.GenreId,
                DeveloperId = queryDto.DeveloperId,
                PlatformId = queryDto.PlatformId
            };




            var (games, totalCount) = await _unit.Games.GetGamesAsync(queryParams);
            var mapped = _mapper.Map<IEnumerable<GameListViewModel>>(games);
            return new PagedResult<GameListViewModel>(mapped, totalCount, queryParams.PageNumber, queryParams.PageSize);
        }

        public async Task UpdateCoverImage(Guid id, string path)
        {
            var game = await _unit.Games.GetByIdAsync(id);
            game.ChangeCoverImagePath(path);
            _unit.Games.Update(game);
        }
    }
}