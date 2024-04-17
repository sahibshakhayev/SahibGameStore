using System;
using System.Linq;
using System.Collections.Generic;
using SahibGameStore.Domain.Entities.Common;
using SahibGameStore.Domain.ValueObjects;
using System.ComponentModel.DataAnnotations;

namespace SahibGameStore.Domain.Entities
{
    public class ShoppingCart : BaseEntity
    {
        protected ShoppingCart() { }

        public ShoppingCart(Guid userId)
        {
            UserId = userId;
            Active = true;
        }

        public ShoppingCart(Guid userId, CartItem item)
        {
            UserId = userId;
            AddItem(item);
            Active = true;
        }

        public ShoppingCart(Guid userId, IEnumerable<CartItem> listOfItems)
        {
            UserId = userId;
            foreach (var item in listOfItems)
                AddItem(item);

            Active = true;
        }


        
        public Guid UserId { get; private set; }

        public IList<CartItem> _listOfItems = new List<CartItem>();

        public Guid? OrderId { get; set; }
        public Order Order { get; set; }

       

        

        
        
        public IEnumerable<CartItem> ListOfItems
        {
            get
            {
                return _listOfItems.ToList();
            }
        }

        public void AddItem(IList<CartItem> listOfItems)
        {
            foreach (var item in listOfItems)
            {
                if (!QuantityIsAvailableInStock(item))
                {
                    AddNonconformity(new Nonconformity("shoppingCart.quantity", "Total quantity exceed the number available in stock."));
                    return;
                }
                if (!AlreadyContainThisItem(item))
                {
                    _listOfItems.Add(item);
                }
                else
                {
                    var foundItem = ListOfItems.Where(_ => _.Product == item.Product).FirstOrDefault();
                    foundItem.ChangeQuantityBy(item.Quantity);
                }
            }
        }

        public void AddItem(CartItem item)
        {
            if (!QuantityIsAvailableInStock(item))
            {
                AddNonconformity(new Nonconformity("shoppingCart.quantity", "Total quantity exceed the number available in stock."));
                return;
            }
            if (!AlreadyContainThisItem(item))
            {
                _listOfItems.Add(item);
            }
            else
            {
                var foundItem = ListOfItems.Where(_ => _ == item).FirstOrDefault();
                foundItem.ChangeQuantityBy(item.Quantity);
            }
        }

        public void UpdateItemQuantity(CartItem item, int newQuantity)
        {
            if (!AlreadyContainThisItem(item))
            {
                throw new ApplicationException("Item not exist in Cart!");
            }
            else
            {
                var foundItem = ListOfItems.Where(_ => _ == item).FirstOrDefault();
                foundItem.ChangeQuantityTo(newQuantity);
            }
        }


        public void RemoveItem(CartItem item)
        {
            _listOfItems.Remove(item);
        }

        public bool AlreadyContainThisItem(CartItem item)
        {
            return ListOfItems.Where(_ => _.Product == item.Product).Count() > 0;
        }

        public bool QuantityIsAvailableInStock(CartItem tryingToAddItem)
        {
            var existingCartItem = ListOfItems.Where(_ => _.Product == tryingToAddItem.Product).FirstOrDefault();
            return (existingCartItem?.Quantity ?? 0 + tryingToAddItem.Quantity) < tryingToAddItem.Product.AvailableQuantity;
        }

        public static implicit operator Task<object>(ShoppingCart v)
        {
            throw new NotImplementedException();
        }
    }
}
