using System;
using System.Linq;
using System.Reflection;
using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Entities.Common;
using SahibGameStore.Domain.Entities.ReleationshipEntities;
using SahibGameStore.Domain.ValueObjects;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SahibGameStore.Domain.Entities.Common;

namespace SahibGameStore.Infracstuture.Data.Context
{
    public class SahibGameStoreContext : IdentityDbContext
    {

        public SahibGameStoreContext(DbContextOptions<SahibGameStoreContext> options)
        : base(options) { }

        public DbSet<Company> Companies { get; set; }
        public DbSet<Game> Games { get; set; }
        public DbSet<GameOverview> GamesOverview { get; set; }
        public DbSet<Genre> Genres { get; set; }
        public DbSet<Platform> Platforms { get; set; }
        public DbSet<Order> Orders { get; set; }

        public DbSet<ShoppingCart> ShoppingCarts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Token> Tokens { get; set; }
        public DbSet<CreditCardPayment> CreditCardPayments { get; set; }
        public DbSet<PayPalPayment> PayPalPayments { get; set; }

        public DbSet<PaymentMethod> PaymentMethods { get; set; }
        public DbSet<Review> Reviews { get; set; }

        public DbSet<Favorite> Favorites { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<GameDeveloper>().HasKey(t => new { t.GameId, t.DeveloperId });

            modelBuilder.Entity<Payment>().OwnsOne(typeof(Email), "Email");

            modelBuilder.Entity<Game>()
    .Property(p => p.RowVersion)
    .IsRowVersion();


            modelBuilder.Entity<GameDeveloper>()
            .HasOne(gg => gg.Game)
            .WithMany("GameDevelopers");

            modelBuilder.Entity<GameDeveloper>()
                .HasOne(gg => gg.Developer)
                .WithMany("GameDevelopers");

            modelBuilder.Entity<GameGenre>().HasKey(t => new { t.GameId, t.GenreId });

            modelBuilder.Entity<GameGenre>()
            .HasOne(gg => gg.Game)
            .WithMany("GameGenres");

            modelBuilder.Entity<GameGenre>()
                .HasOne(gg => gg.Genre)
                .WithMany("GameGenres");

            modelBuilder.Entity<GamePlatform>().HasKey(t => new { t.GameId, t.PlatformId });

            modelBuilder.Entity<GamePlatform>()
            .HasOne(gp => gp.Game)
            .WithMany("GamePlatforms");

            modelBuilder.Entity<GamePlatform>()
                .HasOne(gp => gp.Platform)
                .WithMany("GamePlatforms");

            modelBuilder.Entity<GamePublisher>().HasKey(t => new { t.GameId, t.PublisherId });

            modelBuilder.Entity<GamePublisher>()
            .HasOne(gg => gg.Game)
            .WithMany("GamePublishers");

            modelBuilder.Entity<GamePublisher>()
                .HasOne(gg => gg.Publisher)
                .WithMany("GamePublishers");



            modelBuilder.Entity<ShoppingCart>()
          .HasMany(sc => sc.Items)
          .WithOne(ci => ci.ShoppingCart)
          .HasForeignKey(ci => ci.ShoppingCartId)
          .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CartItem>()
              .HasOne(ci => ci.Game)
              .WithMany()
              .HasForeignKey(ci => ci.GameId)
              .OnDelete(DeleteBehavior.Restrict);



            modelBuilder.Entity<PaymentMethod>()
       .OwnsOne(pm => pm.Email, email =>
       {
           email.Property(e => e.Address)
                .HasColumnName("Email")
                .IsRequired();
       });


            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Review>()
            .HasOne(_ =>_.Product)
            .WithMany(_ => _.Reviews)
            .HasForeignKey(_ => _.ProductId);



            modelBuilder.Entity<Favorite>(entity =>
            {
                entity.HasKey(f => f.Id);

                entity.HasIndex(f => new { f.UserId, f.GameId }).IsUnique();

                entity.HasOne(f => f.Game)
                      .WithMany()
                      .HasForeignKey(f => f.GameId)
                      .OnDelete(DeleteBehavior.Cascade);
            });


        }

        public override int SaveChanges()
        {

            foreach (var entry in ChangeTracker.Entries().Where(entry => entry.Entity.GetType().GetProperty("CreatedDate") != null))
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Property("CreatedDate").CurrentValue = DateTime.Now;
                }
                if (entry.State == EntityState.Modified)
                {
                    entry.Property("CreatedDate").IsModified = false;
                }
            }
            foreach (var entry in ChangeTracker.Entries().Where(entry => entry.Entity.GetType().GetProperty("LastUpdated") != null))
            {
                entry.Property("LastUpdated").CurrentValue = DateTime.Now;
            }
            foreach (var entry in ChangeTracker.Entries().Where(entry => entry.Entity.GetType().GetProperty("Active") != null))
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Property("Active").CurrentValue = true;
                }
            }
            return base.SaveChanges();
        }
    }
}