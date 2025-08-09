using SahibGameStore.Infracstuture.Data.Context;
using SahibGameStore.Domain.Interfaces.Repositories;
using SahibGameStore.Infracstuture.Data.Repositories;
using System;
using System.Collections.Generic;
using System.Text;

namespace SahibGameStore.Infracstuture.Data.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private IGameRepository _gameRepository;
        private ICompanyRepository _companyRepository;
        private IGenreRepository _genreRepository;
        private ITokenRepository _tokenRepository;
        private IPlatformRepository _platformRepository;
        private IUserRepository _userRepository;
        private IOrderRepository _orderRepository;
        private IReviewRepository _reviewRepository;
        private IShoppingCartRepository _shoppingCartRepository;
        private IPaymentMethodRepository _paymentMethodRepository;
        private IFavoriteRepository _favoriteRepository;

        private readonly SahibGameStoreContext _db;
        public UnitOfWork(SahibGameStoreContext db) { _db = db; }

        public IGameRepository Games
        {
            get
            {
                if (_gameRepository == null)
                {
                    _gameRepository = new GameRepository(_db);
                }
                return _gameRepository;
            }
        }

        public ICompanyRepository Companies
        {
            get
            {
                if (_companyRepository == null)
                {
                    _companyRepository = new ComapanyRepository(_db);
                }
                return _companyRepository;
            }
        }

        public IGenreRepository Genres
        {
            get
            {
                if (_genreRepository == null)
                {
                    _genreRepository = new GenreRepository(_db);
                }
                return _genreRepository;
            }
        }

        public IPlatformRepository Platforms
        {
            get
            {
                if (_platformRepository == null)
                {
                    _platformRepository = new PlatformRepository(_db);
                }
                return _platformRepository;
            }
        }

        public IUserRepository Users
        {
            get
            {
                if (_userRepository == null)
                {
                    _userRepository = new UserRepository(_db);
                }
                return _userRepository;
            }
        }

        public IOrderRepository Orders
        {
            get
            {
                if (_orderRepository == null)
                {
                    _orderRepository = new OrderRepository(_db);
                }
                return _orderRepository;
            }
        }

        public IPaymentMethodRepository PaymentMethods
        {
            get
            {
                if (_paymentMethodRepository == null)
                {
                    _paymentMethodRepository = new PaymentMethodRepository(_db);
                }
                return _paymentMethodRepository;
            }
        }


        public IReviewRepository Reviews
        {
            get
            {
                if (_reviewRepository == null)
                {
                    _reviewRepository = new ReviewRepository(_db);
                }
                return _reviewRepository;
            }
        }

        public IShoppingCartRepository Carts
        {
            get
            {
                if (_shoppingCartRepository == null)
                {
                    _shoppingCartRepository = new ShoppingCartRepository(_db);
                }
                return _shoppingCartRepository;
            }
        }


        public IFavoriteRepository Favorites
        {
            get
            {
                if (_favoriteRepository == null)
                {
                    _favoriteRepository = new FavoriteRepository(_db);
                }
                return _favoriteRepository;
            }
        }

        public ITokenRepository Tokens
        {

            get
            {

                if (_tokenRepository == null)
                {
                    _tokenRepository = new TokenRepository(_db);
                }
                return _tokenRepository;


            }




        }

        public void Commit()
        {
            _db.SaveChanges();
        }
        public void Dispose()
        {
            _db.Dispose();
        }

        public void SaveChanges()
        {
            _db.SaveChanges();
        }

        public async Task SaveChangesAsync()
        {
           await _db.SaveChangesAsync();
        }
    }
}
