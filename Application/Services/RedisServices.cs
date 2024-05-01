using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SahibGameStore.Application.Interfaces;
using StackExchange.Redis;


namespace SahibGameStore.Application.Services
{
    
    public class RedisServices :IRedisServices
    {
        private readonly IConnectionMultiplexer _redis;

        public RedisServices(IConnectionMultiplexer redis)
        {
            _redis = redis;
        }

        public async Task<bool> IsTokenBlacklistedAsync(string token)
        {
            var db = _redis.GetDatabase();
            var isBlacklisted = await db.KeyExistsAsync($"blacklist_{token}");
            return isBlacklisted;
        }

        public async Task AddTokenToBlacklistAsync(string token, TimeSpan expiration)
        {
            var db = _redis.GetDatabase();
            await db.StringSetAsync($"blacklist_{token}", true, expiration);
        }

    }

}
