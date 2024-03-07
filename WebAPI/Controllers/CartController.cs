using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using SahibGameStore.Application.DTOS.Cart;
using SahibGameStore.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace SahibGameStore.WebAPI.Controllers
{
    [Route("api/[controller]/[action]")]
    public class CartController : Controller
    {
        
        private readonly ICartServices _cartService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public CartController(ICartServices cartService, IHttpContextAccessor httpContextAccessor)
        {
            _cartService = cartService;
            _httpContextAccessor = httpContextAccessor;
        }
        [Authorize(Roles = "Customer")]
        [HttpPost]
        public async Task<IActionResult> AddItemToCart([FromBody]CartItemDTO item)
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null) {

                return BadRequest("HTTP_CONTEXT_IS_NULL");
            
            }

            var RequestUser = httpContext.User.FindFirst(ClaimTypes.NameIdentifier);

            if (RequestUser == null)
            {
                return Unauthorized("USER_NOTFOUND_OR_AUTH_HEADER_NOTGIVEN");
            }
            try
            {
                var userId = new Guid(RequestUser.Value);
                await _cartService.AddItemToCart(item, userId);
                return Ok(200);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
            
        }


        [Authorize(Roles = "Customer")]
        [HttpDelete]
        public async Task<IActionResult> RemoveItemFromCart(Guid itemId)
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
            {

                return BadRequest("HTTP_CONTEXT_IS_NULL");

            }

            var RequestUser = httpContext.User.FindFirst(ClaimTypes.NameIdentifier);

            if (RequestUser == null)
            {
                return Unauthorized("USER_NOTFOUND_OR_AUTH_HEADER_NOTGIVEN");
            }
            try
            {
                var userId = new Guid(RequestUser.Value);
                await _cartService.RemoveItemFromCart(itemId, userId);
                return Ok(200);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }
    }
}