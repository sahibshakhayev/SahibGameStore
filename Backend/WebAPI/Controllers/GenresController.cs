using SahibGameStore.Application.ViewModels;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using SahibGameStore.Application.Interfaces;
using System.Collections.Generic;
using SahibGameStore.WebAPI.Filters;
using SahibGameStore.Application.DTOS.Genres;
using Microsoft.AspNetCore.Authorization;

namespace SahibGameStore.WebAPI.Controllers
{
    [Route("api/[controller]")]
    public class GenresController : Controller
    {
        private IGenreServices _services;
        public GenresController(IGenreServices services)
        {
            _services = services;
        }

        [HttpGet]
        public async Task<IEnumerable<GenreViewModel>> Get()
        {
            return await _services.GetAllGenres();
        }

        [HttpGet("{id}")]
        public async Task<GenreViewModel> Get(Guid id)
        {
            return await _services.GetGenreById(id);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public void Post([FromBody]AddOrUpdateGenreDTO genre)
        {
            _services.InsertGenre(genre);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut]
        public void Update([FromBody]AddOrUpdateGenreDTO genre)
        {
            _services.UpdateGenre(genre);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public void Delete(Guid id)
        {
            _services.DeleteGenre(id);
        }
    }
}