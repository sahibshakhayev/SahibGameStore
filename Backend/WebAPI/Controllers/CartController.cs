using Application.DTOS.Cart;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SahibGameStore.Application.DTOS.Cart;
using SahibGameStore.Application.DTOS.Companies;
using SahibGameStore.Application.Interfaces;
using SahibGameStore.Application.Services;
using SahibGameStore.Application.ViewModels;
using SahibGameStore.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
namespace SahibGameStore.WebAPI.Controllers
{


    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly ICartServices _service;
        public CartController(ICartServices service) => _service = service;

        private Guid GetUserId() =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

        [HttpGet]
        public async Task<IActionResult> GetCart() =>
            Ok(await _service.GetCartAsync(GetUserId()));

        [HttpPost("add")]
        public async Task<IActionResult> Add([FromBody] AddorUpdateCartItemDto dto)
        {
            await _service.AddAsync(GetUserId(), dto.GameId, dto.Quantity);
            return Ok();
        }

        [HttpPut("update")]
        public async Task<IActionResult> Update([FromBody] AddorUpdateCartItemDto dto)
        {
            await _service.UpdateAsync(GetUserId(), dto.GameId, dto.Quantity);
            return Ok();
        }

        [HttpDelete("remove/{gameId}")]
        public async Task<IActionResult> Remove(Guid gameId)
        {
            await _service.RemoveAsync(GetUserId(), gameId);
            return Ok();
        }

        [HttpPost("submit")]
        public async Task<IActionResult> Submit()
        {
            await _service.SubmitOrderAsync(GetUserId());
            return Ok("Order submitted");
        }
    }

}
