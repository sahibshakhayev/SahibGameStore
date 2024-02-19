using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SahibGameStore.Application.Commands;
using SahibGameStore.Application.Interfaces;
using System.Linq;
using Microsoft.AspNetCore.Identity;
using System;

namespace SahibGameStore.WebAPI.Controllers
{
    [Route("api/[controller]/[action]")]
    public class OrdersController : Controller
    {
        private readonly UserManager<IdentityUser> _userManager;
        private IOrderServices _services;
        public OrdersController(IOrderServices services, UserManager<IdentityUser> userManager)
        {
            _services = services;
            _userManager = userManager;
        }

        [Authorize(Roles = "Customer")]
        [HttpPost]
        public CommandResult FinishCreditCardOrder([FromBody]FinishCreditCardOrderCommand order)
        {
            //todo create handler
            return _services.FinishCreditCardOrder(order, Guid.Parse(_userManager.GetUserId(HttpContext.User)));
        }

        [Authorize(Roles = "Customer")]
        [HttpPost]
        public CommandResult FinishPayPalOrder([FromBody]FinishPayPalOrderCommand order)
        {
            //todo create handler
            return _services.FinishPayPalOrder(order, Guid.Parse(_userManager.GetUserId(HttpContext.User)));
        }
    }
}