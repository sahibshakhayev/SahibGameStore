using Application.Interfaces;
using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Identity;
using SahibGameStore.Domain.Interfaces.Repositories;
using SahibGameStore.Domain.Entities.Common;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Application.ViewModels;
using System.Security.Cryptography;

public class TokenServices:ITokenServices
{
    private readonly IConfiguration _configuration;
    private IUnitOfWork _unit;
    private IMapper _mapper;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public TokenServices(IUnitOfWork unit, IMapper mapper,IConfiguration configuration, UserManager<IdentityUser> userManager, RoleManager<IdentityRole> roleManager)
    {
        _unit = unit;
        _mapper = mapper;
       _configuration = configuration;
        _userManager = userManager;
        _roleManager = roleManager;

    }


    public async Task<object> GenerateJwtToken(IdentityUser user, string? r_token)
    {
        var claims = new List<Claim>
{
    new Claim(ClaimTypes.NameIdentifier, user.Id),  
    new Claim(ClaimTypes.Name, user.UserName),
    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
    new Claim(JwtRegisteredClaimNames.Sub, user.UserName)
};

        var userClaims = await _userManager.GetClaimsAsync(user);
        var userRoles = await _userManager.GetRolesAsync(user);

        claims.AddRange(userClaims);
        claims.AddRange(userClaims);
        foreach (var userRole in userRoles)
        {
            claims.Add(new Claim(ClaimTypes.Role, userRole));
            var role = await _roleManager.FindByNameAsync(userRole);
            if (role != null)
            {
                var roleClaims = await _roleManager.GetClaimsAsync(role);
                foreach (Claim roleClaim in roleClaims)
                {
                    claims.Add(roleClaim);
                }
            }
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtKey"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.Now.AddDays(Convert.ToDouble(_configuration["JwtExpireDays"]));

        var token = new JwtSecurityToken(
            _configuration["JwtIssuer"],
            _configuration["JwtAudience"],
            claims,
            expires: expires,
            signingCredentials: creds
        );
        var refresh_token = await GenerateRefreshToken();
        var n_token = await _unit.Tokens.GetTokenbyUserId(Guid.Parse(user.Id));

        if (n_token != null && n_token.RefreshTokenExpiryTime > DateTime.Now && n_token.ActivatedSince >= n_token.ActivatedSince.AddDays(Convert.ToDouble(_configuration["JwtExpireDays"])) && r_token is not null)
        {

            n_token.Refresh(refresh_token.ToString(), new JwtSecurityTokenHandler().WriteToken(token));

            _unit.Tokens.Update(n_token);

        }

        else if (n_token != null && n_token.ActivatedSince < n_token.ActivatedSince.AddDays(Convert.ToDouble(_configuration["JwtExpireDays"])) && r_token is not null)
        {
            return ("It is not seems as your token is expired. Please do after: " + n_token.ActivatedSince.AddDays(Convert.ToDouble(_configuration["JwtExpireDays"])));
        }
        



        else
        {
            n_token = new Token(Guid.Parse(user.Id), new JwtSecurityTokenHandler().WriteToken(token), refresh_token.ToString());
            _unit.Tokens.Add(n_token);
        }

        return _mapper.Map<TokenViewModel>(n_token);
            
            
            


    }

    private async Task<object> GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }


    public Task<Token> GetTokenbyAccessToken(string accessToken)
    {
        return _unit.Tokens.GetTokenbyAccessToken(accessToken);
    }

    public async Task CancelToken(string token)
    {
        var uToken = await _unit.Tokens.GetTokenbyAccessToken(token);

        if (uToken is not null)
        {

            uToken.CancelToken();

            _unit.Tokens.Update(uToken);

            return;

        }
    }

    
}
