using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using SahibGameStore.WebAPI.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using System.Configuration;
using Application.Interfaces;
using SahibGameStore.Application.Interfaces;

namespace SahibGameStore.WebAPI.Controllers
{
    [Route("api/[controller]/[action]")]
    public class AccountController : Controller
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly ITokenServices _TokenService;
        private readonly IConfiguration _configuration;
        private readonly IRedisServices _redisService;

        public AccountController(
            UserManager<IdentityUser> userManager,
            RoleManager<IdentityRole> roleManager,
            SignInManager<IdentityUser> signInManager,
            ITokenServices TokenService,
            IConfiguration configuration,
            IRedisServices redisService
            )
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _TokenService = TokenService;
            _redisService  = redisService;
        }

        [HttpPost]
        public async Task<object> Login([FromBody] LoginDto model)
        {
            var result = await _signInManager.PasswordSignInAsync(model.UserName, model.Password, false, false);

            if (result.Succeeded)
            {
                var appUser = _userManager.Users.SingleOrDefault(r => r.UserName == model.UserName);
                return await _TokenService.GenerateJwtToken(appUser,null);
            }

            return Unauthorized("INVALID_LOGIN_ATTEMPT");
        }

        [HttpPost]
        public async Task<object> Register([FromBody] RegisterDto model)
        {
            var user = new IdentityUser
            {
                UserName = model.UserName,
                Email = model.Email
            };
            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                await _signInManager.SignInAsync(user, false);
                return new
                {
                    token = await _TokenService.GenerateJwtToken(user, null)
                };
            }
            return new BadRequestObjectResult(Json(result.Errors));
        }


        [HttpPut]
        [Authorize(Roles = "Admin, Customer")]
        public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordDto model)
        {
            if (model.NewPassword != model.RepeatPassword)
            {
                return BadRequest("REPEAT_NOT_MATCH_WITH_NEW_PASSWORD");

            }
            var appUser = _userManager.Users.FirstOrDefault(u => u.UserName == _userManager.GetUserId(HttpContext.User));

            var result = await _userManager.ChangePasswordAsync(appUser, model.OldPassword, model.NewPassword);

           if (result.Succeeded)
            {

  

       

                return Ok("Password changed successfully!");
            }
            

            return Unauthorized(result.Errors.ToList());
        }

    

        [HttpGet]
        public object UserClaims()
        {
            if (!User.Identity.IsAuthenticated)
                return new BadRequestObjectResult("User not found");

            var identityClaims = (ClaimsIdentity)User.Identity;
            var roles = identityClaims.FindAll(ClaimTypes.Role);
            return new AccountModel()
            {
                UserName = identityClaims.FindFirst("sub").Value,
                Roles = roles.Select(_ => _.Value)
            };
        }



        [HttpPost]

        public async Task<IActionResult> Refresh([FromBody] RefreshDto model)
        {


            if (model.RefreshToken is null || model.RefreshToken == String.Empty || model.ExpiredAccessToken is null || model.ExpiredAccessToken == String.Empty)
            {
                return BadRequest("Invalid client request");
            }
           

            
            var CurrentToken = await _TokenService.GetTokenbyAccessToken(model.ExpiredAccessToken);
            if (CurrentToken.RefreshToken != model.RefreshToken || CurrentToken.RefreshTokenExpiryTime <= DateTime.Now)
            {

                return BadRequest("Invalid client request");
            }
            var user = _userManager.Users.FirstOrDefault(u => u.Id == CurrentToken.UserId.ToString());
            var newAccessToken = await _TokenService.GenerateJwtToken(user,model.RefreshToken);
            
            return Ok(newAccessToken);
        }











        [HttpPost]
        [Authorize(Roles = "Admin, Customer")]
        public async Task<IActionResult> Logout()
        {
            var token = Request.Headers["Authorization"].FirstOrDefault()?.Replace("Bearer ", "");

            if (await _redisService.IsTokenBlacklistedAsync(token))
            {
                return BadRequest("Token has been blacklisted");
            }

            // Добавляем токен в черный список
            await _redisService.AddTokenToBlacklistAsync(token, TimeSpan.FromDays(7));

            await _TokenService.CancelToken(token);

            return Ok("Logged out successfully");
        }
    

        public class LoginDto
        {
            [Required]
            public string UserName { get; set; }

            [Required]
            public string Password { get; set; }

        }



        public class ChangePasswordDto
        {
            

            [Required]
            public string OldPassword { get; set; }

            [Required]
            [StringLength(100, ErrorMessage = "PASSWORD_MIN_LENGTH", MinimumLength = 6)]
            public string NewPassword { get; set; }

            [Required]
            public string RepeatPassword { get; set; }

        }
    }




        public class RegisterDto
        {
            [Required]
            public string Email { get; set; }

            [Required]
            public string UserName { get; set; }

            [Required]
            [StringLength(100, ErrorMessage = "PASSWORD_MIN_LENGTH", MinimumLength = 6)]
            public string Password { get; set; }

         }


    public class RefreshDto
    {
        [Required]
        public string ExpiredAccessToken { get; set; }

        [Required]
        public string RefreshToken { get; set; }

    }


}

