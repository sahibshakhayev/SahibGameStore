﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using SahibGameStore.Domain.Entities.Common;
using SahibGameStore.Domain.Entities.ReleationshipEntities;
using SahibGameStore.Domain.ValueObjects;

namespace SahibGameStore.Domain.Entities
{
    public class Company : BaseEntity
    {
        protected Company() { }

        public Company(string name, DateTime founded)
        {
            Name = name;
            Founded = founded;

            if (String.IsNullOrEmpty(name))
                AddNonconformity(new Nonconformity("company.name.fantasyName", "Fantasy Name cannot be null."));
        }

        public string Name { get; private set; }
        public DateTime Founded { get; private set; }
        public string LogoPath { get; private set; } = string.Empty;

        public ICollection<GameDeveloper> GameDevelopers { get; private set; }
        public ICollection<GamePublisher> GamePublishers { get; private set; }

        public void ChangeName(string name)
        {
            Name = name;
        }
    }
}
