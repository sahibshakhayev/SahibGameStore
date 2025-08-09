using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using DotNetEnv;
using SahibGameStore.WebAPI;
using System;
using SahibGameStore.WebAPI;
using SahibGameStore.Infracstuture.Data.Context;



public class Program
{
    public static void Main(string[] args)
    {
        Env.Load();

        CreateHostBuilder(args).Build()
            .CreateDatabase()
            .SeedDbContext<SahibGameStoreContext>()
            .Run();
    }

    public static IHostBuilder CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)
            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder.UseStartup<Startup>();
            });
}
