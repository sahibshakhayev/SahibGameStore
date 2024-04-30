using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using SahibGameStore.Infracstuture.Data.Context;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using SahibGameStore.Application.Interfaces;
using SahibGameStore.Application.Services;
using Serilog;

namespace SahibGameStore.WebAPI
{
    public static class Extensions
    {
        public static IHost SeedDbContext<TContext>(this IHost host) where TContext : DbContext
        {
            using (var scope = host.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try
                {
                    var context = services.GetRequiredService<SahibGameStoreContext>();
                    var configuration = services.GetRequiredService<IConfiguration>();
                    var userManager = services.GetRequiredService<UserManager<IdentityUser>>();
                    var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
                    DbInitializer.Initialize(context, configuration, userManager, roleManager).GetAwaiter().GetResult();
                }
                catch (Exception ex)
                {
                    var logger = services.GetRequiredService<ILogger<Program>>();
                    logger.LogError(ex, "An error occurred while seeding the database.");
                }
            }

            return host;
        }

        public static IHost CreateDatabase(this IHost host)
        {
            using (var scope = host.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try
                {
                    var context = services.GetRequiredService<SahibGameStoreContext>();
                    context.Database.EnsureCreated();
                    context.SaveChanges();
                }
                catch (Exception ex)
                {
                    var logger = services.GetRequiredService<ILogger<Program>>();
                    logger.LogError(ex, "An error occurred while seeding the database.");
                }
            }
            return host;
        }


        public class TokenBlacklistMiddleware
        {
            private readonly RequestDelegate _next;
            private readonly IRedisServices _redisService;
            private readonly Serilog.ILogger _logger;

            public TokenBlacklistMiddleware(RequestDelegate next, IRedisServices redisService, Serilog.ILogger logger)
            {
                _next = next;
                _redisService = redisService;
                _logger = logger;
            }

            public async Task Invoke(HttpContext context)
            {
                var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Replace("Bearer ", "");
                if (await _redisService.IsTokenBlacklistedAsync(token))
                {
                    context.Response.StatusCode = 401;
                   // Токен находится в черном списке
                    return;
                }

                
                await _next(context);
            }
        }








    }
}
