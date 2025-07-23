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
            services.AddTransient<IPaymentMethodServices, PaymentMethodServices>();
            services.AddTransient<IReviewServices, ReviewServices>();
            services.AddTransient<ICartServices, CartServices>();
            services.AddTransient<IUnitOfWork, UnitOfWork>();
            services.AddSingleton<IRedisServices, RedisServices>();
            services.AddSingleton<IConnectionMultiplexer>(ConnectionMultiplexer.Connect("redis-17331.c13.us-east-1-3.ec2.redns.redis-cloud.com:17331,password=usFm0TI1T95Wm5z4kpGPOdW4CgpfHZrU"));
            
            services.AddScoped<IMapper>(sp => new Mapper(sp.GetRequiredService<AutoMapper.IConfigurationProvider>(), sp.GetService));
            services.AddScoped<RoleManager<IdentityRole>>(); 
            services.AddScoped<UserManager<IdentityUser>>();
            services.AddSingleton(Log.Logger);
            services.AddTransient<ITokenServices, TokenServices>();
            services.AddTransient<IEmailServices, EmailServices>();
            
        }
    }
}