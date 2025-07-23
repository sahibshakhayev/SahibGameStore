using SahibGameStore.Domain.Entities.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SahibGameStore.Domain.Entities.Common
{
    public class Token: BaseEntity
    {
        public Guid Id { get; set; }

        public Guid UserId { get; private set; }

        public string AccessToken { get; private set; }

        public string RefreshToken { get; private set; }
        public DateTime ActivatedSince { get; private set; } = DateTime.Now;

        public DateTime RefreshTokenExpiryTime { get; private set; } = DateTime.Now.AddDays(7);
        public DateTime? DeactivatedSince { get; private set; }

        public Token(Guid UserId, string AccessToken, string RefreshToken ) {
        
        this.UserId = UserId;
        this.AccessToken = AccessToken;
        this.RefreshToken = RefreshToken;
        Active = true;
        
        
        
        }

        public void CancelToken() { 
          DeactivatedSince = DateTime.Now;
          Deactivate();
        
        
        }

        public void Refresh(string r_token, string a_token)
        {
            this.RefreshToken = r_token;
            this.AccessToken = a_token;
            this.RefreshTokenExpiryTime = DateTime.Now.AddDays(7);
            this.ActivatedSince = DateTime.Now;

        }


    }
}
