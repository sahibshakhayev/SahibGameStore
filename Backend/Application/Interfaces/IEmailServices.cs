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
    public interface IEmailServices
    {

        Task<object> SendEmailAsync(string email, string subject, string message);
    }
}
