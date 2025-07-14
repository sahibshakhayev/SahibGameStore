using AutoMapper;
using SahibGameStore.Application.Interfaces;
using SahibGameStore.Application.Services;
using SahibGameStore.Domain.Interfaces.Repositories;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Identity;
using SahibGameStore.Infracstuture.Data.Repositories;
using Serilog;
using StackExchange.Redis;
using Application.Interfaces;
using SahibGameStore.Infracstuture.Data.Context;

namespace SahibGameStore.Infracstuture.Injector
{
    public class Injection
    {
        public static void RegisterServices(IServiceCollection services)
        {
            services.AddTransient<IGameServices, GameServices>();
            services.AddTransient<ICompanyServices, CompanyServices>();
            services.AddTransient<IGenreServices, GenreServices>();
            services.AddTransient<IOrderServices, OrderServices>();
            services.AddTransient<IPlatformServices, PlatformServices>();
            services.AddTransient<IReviewServices, ReviewServices>();
            services.AddTransient<ICartServices, CartServices>();
            services.AddTransient<IUnitOfWork, UnitOfWork>();
            services.AddSingleton<IRedisServices, RedisServices>();
            services.AddSingleton<IConnectionMultiplexer>(ConnectionMultiplexer.Connect("redis-18065.c270.us-east-1-3.ec2.redns.redis-cloud.com:18065,password=6pREbKS0JpiN91VUmvnDBzQfGs8q7jbq"));
            
            services.AddScoped<IMapper>(sp => new Mapper(sp.GetRequiredService<AutoMapper.IConfigurationProvider>(), sp.GetService));
            services.AddScoped<RoleManager<IdentityRole>>(); 
            services.AddScoped<UserManager<IdentityUser>>();
            services.AddSingleton(Log.Logger);
            services.AddTransient<ITokenServices, TokenServices>();
            services.AddTransient<IEmailServices, EmailServices>();
            
        }
    }
}