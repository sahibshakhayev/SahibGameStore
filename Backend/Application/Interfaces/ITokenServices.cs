using Microsoft.IdentityModel.Tokens;
using StackExchange.Redis;
using System;
using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using SahibGameStore.Domain.Entities.Common;

namespace Application.Interfaces
{
    public interface ITokenServices
    {

        Task<Token> GetTokenbyAccessToken(string accessToken);
        Task<object> GenerateJwtToken(IdentityUser user, string? r_token);


        Task CancelToken(string token);

    }
}
