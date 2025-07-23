﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using SahibGameStore.Domain.ValueObjects;

namespace SahibGameStore.Domain.Entities.Common
{

    public abstract class BaseEntity
    {

        [NotMapped]
        public IList<Nonconformity> Nonconformities { get; private set; } = new List<Nonconformity>();
        [NotMapped]
        public bool IsInvalid { get { return Nonconformities.Count > 0; } }
        [NotMapped]
        public bool IsValid { get { return Nonconformities.Count == 0; } }

        public BaseEntity()
        {
           
        }

        public Guid Id { get; set; } = Guid.NewGuid();
        public DateTime CreatedDate { get; private set; } = DateTime.UtcNow;
        public DateTime LastUpdated { get; private set; }
        public bool Active { get; protected set; }

        public void AddNonconformity(Nonconformity nonconformity)
        {
            Nonconformities.Add(nonconformity);
        }

        public void AddNonconformity(params BaseEntity[] baseEntities)
        {
            foreach (var item in baseEntities)
            {
                if (item != null)
                    Nonconformities = Nonconformities.Concat(item.Nonconformities).ToList();
            }
        }

        public void AddNonconformity(params ValueObject[] baseEntities)
        {
            foreach (var item in baseEntities)
            {
                if (item != null)
                    Nonconformities = Nonconformities.Concat(item.Nonconformities).ToList();
            }
        }

        public void Deactivate()
        {
            this.Active = false;
        }
    }
}
