using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SahibGameStore.Application.Commands;
using SahibGameStore.Application.Interfaces;
using System.Linq;
using Microsoft.AspNetCore.Identity;
using System;
using SahibGameStore.Application.DTOS.Reviews;
using SahibGameStore.Application.ViewModels;
using System.Collections.Generic;
using SahibGameStore.Domain.Entities;
using SahibGameStore.Application.Services;

namespace SahibGameStore.WebAPI.Controllers
{
    [Route("api/[controller]")]
    public class ReviewsController : Controller
    {
        private readonly UserManager<IdentityUser> _userManager;
        private IReviewServices _services;
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
            var id = _services.Save(review);
            if(id != null) {
                return new OkObjectResult(new ResultViewModel(id,200,"Success!"));
            } else {
                return new BadRequestObjectResult(new ResultViewModel(500, "Something went wrong! Try again later."));
            }
        }
    }
}