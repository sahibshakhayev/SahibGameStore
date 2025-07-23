﻿using System.Collections.Generic;
using SahibGameStore.Domain.Entities.Enums;
using SahibGameStore.Domain.ValueObjects;
using System.Linq;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace SahibGameStore.Domain.Entities.Common
{
    public abstract class Product : BaseEntity
    {
        protected Product() { }
        public Product(string name, EDepartment department, double price, string description, string shortDescription, int availableQuantity)
        {
            Name = name;
            Department = department;
            Price = price;
            Description = description;
            ShortDescription = shortDescription;
            AvailableQuantity = availableQuantity;
            TotalQuantity = availableQuantity;

            if (string.IsNullOrEmpty(Name))
                AddNonconformity(new Nonconformity("product.name", "Name cannot be null or empty"));
            if (string.IsNullOrEmpty(Description))
                AddNonconformity(new Nonconformity("product.description", "Description cannot be null or empty"));
            if (Price <= 0)
                AddNonconformity(new Nonconformity("product.price", "Price cannot be 0 or a negative number"));
        }
         
        public string Name { get; private set; }
        public EDepartment Department { get; private set; }
        public double Price { get; private set; }

        public int TotalQuantity { get; set; }
        public int AvailableQuantity { get; set; }
        public string Description { get; private set; }
        public string ShortDescription { get; private set; }
        public string ImageRelativePath { get; internal set; }


        public void DecreaseAvailable(int qty)
        {
            if (AvailableQuantity < qty)
                throw new ApplicationException("Insufficient stock");
            AvailableQuantity -= qty;
        }

        public void DecreaseTotal(int qty)
        {
            if (TotalQuantity < qty)
                throw new ApplicationException("Insufficient stock");
            TotalQuantity -= qty;
        }

        public void IncreaseAvailable(int qty) => AvailableQuantity += qty;


        public ICollection<Review> Reviews { get; private set; } = new List<Review>();

        [NotMapped]
        public double? UsersScore
        {
            get
            {
                if (Reviews?.Count > 0)
                    return Math.Round(Reviews.Sum(_ => _.Rating) / Reviews.Count, 1);
                else
                    return null;
            }
            set
            {
                value = null;
            }
        }

        public void ChangeName(string name)
        {
            Name = name;
        }

        public void ChangePrice(double price)
        {
            Price = price;
        }

        public void ChangeAvailableQuantity(int quantity)
        {
            AvailableQuantity = quantity;
        }

        public void ChangeDescription(string description)
        {
            Description = description;
        }

        public void ChangeShortDescription(string shortDescription)
        {
            ShortDescription = shortDescription;
        }

        public void ChangeImagePath(string imagePath)
        {
            ImageRelativePath = imagePath;
        }
    }
}
