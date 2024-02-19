using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using SahibGameStore.WebAPI;
using System;
using SahibGameStore.WebAPI;
using SahibGameStore.Infracstuture.Data.Context;


CreateHostBuilder(args).Build()
                .CreateDatabase()
                .SeedDbContext<SahibGameStoreContext>()
                .Run();

static IHostBuilder CreateHostBuilder(string[] args) =>
           Host.CreateDefaultBuilder(args)
               .ConfigureWebHostDefaults(webBuilder =>
               {
                   webBuilder.UseStartup<Startup>();
               });
