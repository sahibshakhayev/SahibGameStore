using Application.DTOS.Common;
using Application.Interfaces;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SahibGameStore.Application.Interfaces;
using SahibGameStore.Application.Services;
using SahibGameStore.WebAPI.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Google.Apis.Auth;










namespace SahibGameStore.WebAPI.Controllers
{
    [Route("api/[controller]/[action]")]
    public class AccountController : Controller
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ITokenServices _TokenService;
        private readonly IConfiguration _configuration;
        private readonly IRedisServices _redisService;
        private readonly IEmailServices _emailService;
        private readonly IPaymentMethodServices _paymentMethodServices;

        public AccountController(
            UserManager<IdentityUser> userManager,
            RoleManager<IdentityRole> roleManager,
            SignInManager<IdentityUser> signInManager,
            ITokenServices TokenService,
            IConfiguration configuration,
            IRedisServices redisService,
            IEmailServices emailServices,
            IPaymentMethodServices paymentMethodServices
            )
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
            _TokenService = TokenService;
            _redisService = redisService;
            _emailService = emailServices;
            _paymentMethodServices = paymentMethodServices;
        }


        private Guid GetUserId() =>
           Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));







        [HttpPost]
        public async Task<object> Login([FromBody] LoginDto model)
        {
            var user = await _userManager.FindByNameAsync(model.UserName);
            if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
            {
                return await _TokenService.GenerateJwtToken(user, null);
            }
            return Unauthorized("INVALID_LOGIN_ATTEMPT");
        }

        [HttpPost]
        public async Task<object> Register([FromBody] RegisterDto model)
        {
            var user = new IdentityUser
            {
                Id = Guid.NewGuid().ToString(),
                UserName = model.UserName,
                Email = model.Email
            };
            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(user, "Customer");
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


            var userId = GetUserId().ToString();
            var appUser = _userManager.Users.FirstOrDefault(u => u.Id == userId);

            var result = await _userManager.ChangePasswordAsync(appUser, model.OldPassword, model.NewPassword);

            if (result.Succeeded)
            {





                return Ok("Password changed successfully!");
            }


            return Unauthorized(result.Errors.ToList());
        }


        [Authorize]
        [HttpGet]
        public object UserClaims()
        {
            if (!User.Identity.IsAuthenticated)
                return new BadRequestObjectResult("User not found");

            var identityClaims = (ClaimsIdentity)User.Identity;
            var roles = identityClaims.FindAll(ClaimTypes.Role);
            return new AccountModel()
            {
                UserName = User.Identity.Name,
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
            var newAccessToken = await _TokenService.GenerateJwtToken(user, model.RefreshToken);

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


        [HttpPost("send")]
        public async Task<object> PasswordReset([FromBody] ResetPasswordDto model)
        {
            var user = _userManager.Users.FirstOrDefault(u => u.Email == model.Email);

            if (user == null)
            {
                return BadRequest("User not found");


            }



            var token = await _userManager.GeneratePasswordResetTokenAsync(user);



            var callbackUrl = "https://" + HttpContext.Request.Host.ToString() + "/api/Account/PasswordReset/check_token?email=" + HttpUtility.UrlEncode(model.Email) + "&token=" + HttpUtility.UrlEncode(token);
            var message = "<h1>Hello, " + user.UserName + "</h1> <p>You requested a password reset request</p> <p> Follow this link:<a href=" + callbackUrl + "  action=\"_blank\">Reset Password</a> in order to reset password</p>";

            var result = await _emailService.SendEmailAsync(model.Email, "Password Reset", message);


            if (result.GetType() == typeof(string) && result == "OK")
            {


                return Ok("Please follow link that sent your email");
            }

            return result;
        }

        [HttpGet("check_token")]
        public async Task<IActionResult> PasswordReset(string email, string token)
        {
            var user = _userManager.Users.FirstOrDefault(u => u.Email == email);

            if (user == null)
            {
                return BadRequest("User not found");


            }



            if (await _userManager.VerifyUserTokenAsync(user, _userManager.Options.Tokens.PasswordResetTokenProvider, "ResetPassword", token))
            {
                return Ok("VALID_TOKEN");

            }


            else
            {




                return Unauthorized("INVALID_TOKEN");
            }

        }

        [HttpPut("reset")]
        public async Task<IActionResult> PasswordReset([FromBody] NewPasswordDto model)
        {
            var user = _userManager.Users.FirstOrDefault(u => u.Email == model.Email);

            if (user == null)
            {
                return BadRequest("User not found");


            }



            if (await _userManager.VerifyUserTokenAsync(user, _userManager.Options.Tokens.PasswordResetTokenProvider, "ResetPassword", model.Token))
            {

                var result = await _userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);


                if (result.Succeeded)
                {
                    return Ok("Password Recovered!");

                }

                return BadRequest("Recovery Failed!");

            }


            else
            {




                return Unauthorized("INVALID_TOKEN");
            }

        }









        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> GoogleAuth([FromBody] GoogleAuthDto model)
        {
            try
            {
                // Verify the Google ID token
                var payload = await GoogleJsonWebSignature.ValidateAsync(model.IdToken, new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { _configuration["Authentication:Google:ClientId"] }
                });

                var email = payload.Email;
                var name = payload.Name;

                if (string.IsNullOrEmpty(email))
                    return BadRequest("Email not found in Google token");

                // Use your existing UserManager methods
                var user = await _userManager.FindByEmailAsync(email);

                if (user == null)
                {
                    // Create new user using your existing pattern
                    user = new IdentityUser
                    {
                        Id = Guid.NewGuid().ToString(),
                        UserName = email,
                        Email = email
                    };

                    var createResult = await _userManager.CreateAsync(user);
                    if (!createResult.Succeeded)
                        return BadRequest("User creation failed");

                    // Add to Customer role using your existing pattern
                    await _userManager.AddToRoleAsync(user, "Customer");
                }

                // Generate JWT using your existing TokenService
                var token = await _TokenService.GenerateJwtToken(user, null);

                return Ok(token);
            }
            catch (InvalidJwtException)
            {
                return BadRequest("Invalid Google token");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Authentication failed");
            }
        }



        [Authorize]
        [HttpGet]
        public async Task<IActionResult> PaymentMethods()
        {
            var userId = Guid.Parse(_userManager.GetUserId(User));
            var result = await _paymentMethodServices.GetAllByUser(userId);
            return Ok(result);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> PaymentMethod(Guid id)
        {
            var result = await _paymentMethodServices.GetByIdAsync(id);
            return result == null ? NotFound("Payment method not found") : Ok(result);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> PaymentMethod([FromBody] AddorUpdatePaymentMethodDto dto)
        {
            var userId = Guid.Parse(_userManager.GetUserId(User));

            try
            {
                await _paymentMethodServices.AddAsync(userId, dto);
                return Ok("Payment method added");


            }

            catch (Exception ex) { 
            
            
            return BadRequest(ex.Message);
            }
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> PaymentMethod(Guid id, [FromBody] AddorUpdatePaymentMethodDto dto)
        {

            try
            {



                await _paymentMethodServices.UpdateAsync(id, dto);
                return Ok("Payment method updated");


            }

            catch (Exception ex) { 
            
            
            return BadRequest(ex.Message);
            }
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> PaymentMethodDelete(Guid id)
        {
            await _paymentMethodServices.DeleteAsync(id);
            return Ok("Payment method deleted");
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


        public class ResetPasswordDto
        {
            [Required]
            public string Email { get; set; }




        }


        public class NewPasswordDto

        {
            [Required]
            public string Email { get; set; }

            [Required]
            public string Token { get; set; }


            

            [Required]
            [StringLength(100, ErrorMessage = "PASSWORD_MIN_LENGTH", MinimumLength = 6)]
            public string NewPassword { get; set; }


            [Required]
            public string ConfirmPassword { get; set; }






        }


        public class GoogleAuthDto
        {
            [Required]
            public string IdToken { get; set; }
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

}

