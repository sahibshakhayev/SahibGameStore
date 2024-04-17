using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using SahibGameStore.Application.DTOS.Companies;
using SahibGameStore.Application.Interfaces;
using SahibGameStore.Application.Services;
using SahibGameStore.Application.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SahibGameStore.Application.DTOS.Cart;
using SahibGameStore.Domain.Entities;
using Microsoft.AspNetCore.Identity;
namespace SahibGameStore.WebAPI.Controllers
{
    [Route("api/[controller]")]
    public class CartController : Controller
    {

        private readonly UserManager<IdentityUser> _userManager;
        private readonly ICartServices _cartServices;

        public CartController(ICartServices cartServices, UserManager<IdentityUser> userManager)
        {
            _cartServices = cartServices;
            _userManager = userManager;
        }
        [Authorize(Roles = "Customer")]
        [HttpGet]
        public async Task<ActionResult<ShoppingCart>> GetUserCart()
        {
            try
            {
                var cart = await _cartServices.GetUserCart(Guid.Parse(_userManager.GetUserId(HttpContext.User)));
                if (cart == null)
                {
                    return NotFound("No cart found for this user.");
                }
                return Ok(cart);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize(Roles = "Customer")]
        [HttpPost]
  
        public async Task<ActionResult> AddItemToCart(CartItemDTO item)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                await _cartServices.AddItemToCart(item, Guid.Parse(_userManager.GetUserId(HttpContext.User)));
                return Ok("Item added to cart successfully.");
            }
            catch (ApplicationException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        [Authorize(Roles = "Customer")]
        [HttpDelete]
       
        public async Task<ActionResult> RemoveItemFromCart(CartItemDTO item)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                await _cartServices.RemoveItemFromCart(item, Guid.Parse(_userManager.GetUserId(HttpContext.User)));
                return Ok("Item removed from cart successfully.");
            }
            catch (ApplicationException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        [Authorize(Roles = "Customer")]
        [HttpPut("{newQuantity}")]
       
        public async Task<ActionResult> SetItemQuantity(CartItemDTO item, int newQuantity)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                await _cartServices.SetItemQuantity(item, Guid.Parse(_userManager.GetUserId(HttpContext.User)), newQuantity);
                return Ok("Item quantity updated successfully.");
            }
            catch (ApplicationException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

    }
}
