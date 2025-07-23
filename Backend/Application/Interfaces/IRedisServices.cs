using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SahibGameStore.Application.Interfaces
{
    public interface IRedisServices
    {

        Task<bool> IsTokenBlacklistedAsync(string token);


        Task AddTokenToBlacklistAsync(string token, TimeSpan expiration);
    }
}
