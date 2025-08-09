namespace SahibGameStore.Domain.Interfaces.Repositories
{
    public interface IUnitOfWork
    {
        ICompanyRepository Companies { get; }
        IGameRepository Games { get; }
        IGenreRepository Genres { get; }
        IPlatformRepository Platforms { get; }
        IUserRepository Users { get ;}
        IOrderRepository Orders { get; }
        IReviewRepository Reviews { get;}

        IFavoriteRepository Favorites { get; }

        ITokenRepository Tokens { get; }

        IShoppingCartRepository Carts { get; }

        IPaymentMethodRepository PaymentMethods {  get; }
        void Dispose();

        void SaveChanges();

        Task SaveChangesAsync();
    }
}