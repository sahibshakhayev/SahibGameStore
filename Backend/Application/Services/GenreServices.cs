using System;
using System.Linq;
using System.Collections.Generic;
using AutoMapper;
using SahibGameStore.Application.Interfaces;
using SahibGameStore.Application.ViewModels;
using SahibGameStore.Domain.Interfaces.Repositories;
using System.Threading.Tasks;
using SahibGameStore.Domain.Entities;
using SahibGameStore.Application.DTOS.Genres;

namespace SahibGameStore.Application.Services
{
    public class GenreServices : IGenreServices
    {
        private IUnitOfWork _unit;
        private IMapper _mapper;
        public GenreServices(IUnitOfWork unit, IMapper mapper)
        {
            _unit = unit;
            _mapper = mapper;
        }

        public async Task<IEnumerable<GenreViewModel>> GetAllGenres()
        {
            return _mapper.Map<IEnumerable<GenreViewModel>>(await _unit.Genres.GetAllAsync());
        }

        public async Task<GenreViewModel> GetGenreById(Guid genreId)
        {
            return _mapper.Map<GenreViewModel>(await _unit.Genres.GetByIdAsync(genreId));
        }
        public void InsertGenre(AddOrUpdateGenreDTO genrevm)
        {
            _unit.Genres.Add(_mapper.Map<Genre>(genrevm));
        }

        public async Task<GenreViewModel> UpdateGenre(Guid id, AddOrUpdateGenreDTO genrevm)
        {
            var genre =  _unit.Genres.GetById(id);

            if (genre == null)
                throw new KeyNotFoundException($"Genre with id {id} not found");

            genre.ChangeName(genrevm.Name);
            genre.ChangeDescription(genrevm.Description);

            _unit.Genres.Update(genre);

            await _unit.SaveChangesAsync();

            return _mapper.Map<GenreViewModel>(genre);
        }




        public void DeleteGenre(Guid id)
        {
            _unit.Genres.Remove(id);
        }
    }
}