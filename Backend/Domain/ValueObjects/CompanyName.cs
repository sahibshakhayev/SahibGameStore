using System;
using Flunt.Validations;
using SahibGameStore.Domain.Entities.Common;

namespace SahibGameStore.Domain.ValueObjects
{
    public class CompanyName : ValueObject
    {
        public CompanyName(string fantasyName)
        {
            FantasyName = fantasyName;
        }

        public string FantasyName { get; private set; }
        public string SocialName { get; private set; }

        public void AddSocialName(string socialName) {
            SocialName = socialName;
        }
    }
}
