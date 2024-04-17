using System;
using System.Linq;
using System.Threading.Tasks;
using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using SahibGameStore.Infracstuture.Data.Context;
using SahibGameStore.Infracstuture.Data.Repositories.Common;
using SahibGameStore.Domain.Entities.Common;

namespace SahibGameStore.Infracstuture.Data.Repositories
{
    public class ShoppingCartRepository : Repository<ShoppingCart>, IShoppingCartRepository
    {
        private readonly SahibGameStoreContext _db;
        public ShoppingCartRepository(SahibGameStoreContext db) : base(db)
        {
            _db = db;
        }

       

        public override Guid Add(ShoppingCart cart)
        {
            try
            {

                if (_db.ShoppingCarts.Where(_ => _.Id == cart.Id && _.Active).Count() > 0)
                    throw new Exception("There is already an active shopping cart for this user");
                else
                    _db.Set<ShoppingCart>().Add(cart);

                _db.SaveChangesAsync();
                return cart.Id;
            }

            catch (Exception ex)
            {
                _db.Entry(cart).Reload();
                _db.SaveChanges();
                return cart.Id;
            }
        }

        public async Task UpdateCart(ShoppingCart cart, CartItem item)
        {
            
        }


        public Task <ShoppingCart> GetCartByUserId(Guid userId)
        {
            return _db.ShoppingCarts.Where(_ => _.UserId == userId).FirstOrDefaultAsync();
        }

        public async Task CreateCart(ShoppingCart cart)
        {
            _db.ShoppingCarts.Add(cart);
            _db.SaveChanges();
        }

        public ShoppingCart GetActiveShoppingCartByUser(Guid userId)
        {
            return _db.ShoppingCarts.Where(c => c.UserId == userId).Include(ci => ci._listOfItems).ToList().FirstOrDefault();


           
            
        }

        public async Task AddItemtoCart(ShoppingCart currentCart, Product product)
        {
           

            try
            {
               

                CartItem cartItem = new CartItem(product, 1);

                currentCart._listOfItems.Add(cartItem);
                await _db.CartItems.AddAsync(cartItem);
                _db.SaveChanges();


            }
            catch (Exception ex)
            {
                throw new Exception("Error when adding item to cart: " + ex.Message);
            }
        }

        public async Task RemoveItemFrom(ShoppingCart currentCart, CartItem item)
        {
            try
            {
               


               currentCart._listOfItems.Remove(item);
                _db.CartItems.Remove(item);
                _db.SaveChanges();


            }
            catch (Exception ex)
            {
                throw new Exception("Error when adding item to cart: " + ex.Message);
            }
        }

        public async Task UpdateItemQuantity(ShoppingCart currentCart, CartItem item)
        {

            try
            {



                currentCart._listOfItems.FirstOrDefault(x => x.Id == item.Id).ChangeQuantityTo(item.Quantity);
                _db.CartItems.Update(item);
                _db.SaveChanges();


            }
            catch (Exception ex)
            {
                throw new Exception("Error when adding item to cart: " + ex.Message);
            }


        }

 
    }
}