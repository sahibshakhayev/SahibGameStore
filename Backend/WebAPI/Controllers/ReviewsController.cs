using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SahibGameStore.Application.Commands;
using SahibGameStore.Application.DTOS.Reviews;
using SahibGameStore.Application.Interfaces;
using SahibGameStore.Application.Services;
using SahibGameStore.Application.ViewModels;
using SahibGameStore.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;

namespace SahibGameStore.WebAPI.Controllers
{
    [Route("api/[controller]")]
    public class ReviewsController : Controller
    {
        private readonly UserManager<IdentityUser> _userManager;
        private IReviewServices _services;


        private Guid GetUserId() =>
           Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));



        public ReviewsController(IReviewServices services, UserManager<IdentityUser> userManager)
        {
            _services = services;
            _userManager = userManager;
        }

        [Route("product/{id}")]
        [HttpGet]
        public IEnumerable<ReviewListViewModel> GetByProductId(Guid id) {
            return _services.GetReviewByProductId(id);
        }

        [Route("user/{id}")]
        [HttpGet]
        public IEnumerable<ReviewListViewModel> GetByUserId(Guid id) {
            return _services.GetReviewByUserId(id);
        }

        [Authorize(Roles = "Customer")]
        [HttpPost]
        public ActionResult Post([FromBody]AddOrUpdateReviewDTO review)
        {
            var id = _services.Save(review, GetUserId());
            if(id != null) {
                return Ok("Success!");
            } else {
                return new BadRequestObjectResult(new ResultViewModel(500, "Something went wrong! Try again later."));
            }
        }
    }
}