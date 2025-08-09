using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SahibGameStore.Application.DTOS.Companies;
using SahibGameStore.Application.Interfaces;
using SahibGameStore.Application.Services;
using SahibGameStore.Application.ViewModels;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace SahibGameStore.WebAPI.Controllers
{
    [Route("api/[controller]")]
    public class FavoritesController: Controller
    {
        private IFavoriteServices _services;
        private readonly UserManager<IdentityUser> _userManager;

        public FavoritesController(IFavoriteServices services, UserManager<IdentityUser> userManager)
        {
            _services = services;
            _userManager = userManager;
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult> GetFavorites()
        {
            Guid userId = Guid.Parse(_userManager.GetUserId(User));

            var favorites = await _services.GetFavoritesByUserAsync(userId);
            return Ok(favorites);
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult> AddFavorite([FromBody] Guid gameId)
        {
            Guid userId = Guid.Parse(_userManager.GetUserId(User));

            await _services.AddFavoriteAsync(userId, gameId);
            return Ok(new ResultViewModel(gameId, 200, "Game added to favorites"));
        }

        [Authorize]
        [HttpDelete("{gameId}")]
        public async Task<ActionResult> RemoveFavorite(Guid gameId)
        {
            Guid userId = Guid.Parse(_userManager.GetUserId(User));

            await _services.RemoveFavoriteAsync(userId, gameId);
            return Ok(new ResultViewModel(gameId, 200, "Game removed from favorites"));
        }

    }
}