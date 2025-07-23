using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SahibGameStore.Application.Commands;
using SahibGameStore.Application.DTOS.Common;
using SahibGameStore.Application.Interfaces;
using SahibGameStore.Application.ViewModels;
using SahibGameStore.Domain.Entities;
using System;
using System.Linq;

namespace SahibGameStore.WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderServices _orderService;
        private readonly UserManager<IdentityUser> _userManager;

        public OrdersController(IOrderServices orderService, UserManager<IdentityUser> userManager)
        {
            _orderService = orderService;
            _userManager = userManager;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll(int page = 1, int pageSize = 10, Guid? user = null)
            => Ok(await _orderService.GetAllAsync(page, pageSize, user));

        [Authorize]
        [HttpGet("my")]
        public async Task<IActionResult> MyOrders(int page = 1, int pageSize = 10)
        {
            var userId = Guid.Parse(_userManager.GetUserId(User));
            return Ok(await _orderService.GetByUserAsync(userId, page, pageSize));
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id) => Ok(await _orderService.GetByIdAsync(id));

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Submit([FromBody] CreateOrderDto dto)
        {
            var userId = Guid.Parse(_userManager.GetUserId(User));
            await _orderService.SubmitOrderAsync(userId, dto);
            return Ok("Order submitted");
        }

        [Authorize]
        [HttpPost("{id}/finish/paypal")]
        public async Task<IActionResult> FinishPaypal(Guid id)
        {
            await _orderService.FinishPaypalOrder(id);
            return Ok("Order finalized via PayPal");
        }

        [Authorize]
        [HttpPost("{id}/finish/credit")]
        public async Task<IActionResult> FinishCredit(Guid id)
        {
            await _orderService.FinishCreditOrder(id);
            return Ok("Order finalized via Credit Card");
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Edit(Guid id, [FromBody] UpdateOrderDto dto)
        {
            await _orderService.EditOrderAsync(id, dto.Address, dto.Status);
            return Ok("Order updated");
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Cancel(Guid id)
        {
            var userId = Guid.Parse(_userManager.GetUserId(User));
            await _orderService.CancelOrderAsync(id, userId, User.IsInRole("Admin"));
            return Ok("Order canceled");
        }
    }

    public class UpdateOrderDto
    {
        public string Address { get; set; }
        public OrderStatus Status { get; set; }
    }

}