using SahibGameStore.Domain.Entities.Common;
using SahibGameStore.Domain.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using SahibGameStore.Infracstuture.Data.Context;

namespace SahibGameStore.Infracstuture.Data.Repositories.Common
{
    public abstract class Repository<TEntity> : IRepository<TEntity>, IDisposable where TEntity : BaseEntity
    {
        private SahibGameStoreContext _db;

        public Repository(SahibGameStoreContext db)
        {
            _db = db;
        }

        public virtual Guid Add(TEntity obj)
        {
            _db.Set<TEntity>().Add(obj);
            _db.SaveChanges();

            return obj.Id;
        }

        public async virtual Task<IEnumerable<TEntity>> GetAllAsync()
        {
            return await _db.Set<TEntity>().ToListAsync();
        }

        public async virtual Task<TEntity> GetByIdAsync(Guid id)
        {
            return await _db.Set<TEntity>().Where(x => x.Id == id).FirstOrDefaultAsync();
        }
        public virtual void Remove(Guid id)
        {
            var entity = GetById(id);
            _db.Set<TEntity>().Remove(entity);
            _db.SaveChanges();
        }

        public virtual IEnumerable<TEntity> GetAll()
        {
            return _db.Set<TEntity>().ToList();
        }

        public TEntity GetById(Guid id)
        {
            return _db.Set<TEntity>().Where(p => p.Id == id).FirstOrDefault();
        }

        public virtual void Update(TEntity obj)
        {
            var entry = _db.Entry(obj);
            if (entry.State == EntityState.Detached)
            {
                _db.Attach(obj);
                entry.State = EntityState.Modified;
            }
        }




        #region IDisposable Support
        private bool disposedValue = false; // To detect redundant calls

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    // TODO: dispose managed state (managed objects).
                }

                // TODO: free unmanaged resources (unmanaged objects) and override a finalizer below.
                // TODO: set large fields to null.

                disposedValue = true;
            }
        }

        // TODO: override a finalizer only if Dispose(bool disposing) above has code to free unmanaged resources.
        // ~Repositorio() {
        //   // Do not change this code. Put cleanup code in Dispose(bool disposing) above.
        //   Dispose(false);
        // }

        // This code added to correctly implement the disposable pattern.
        public void Dispose()
        {
            // Do not change this code. Put cleanup code in Dispose(bool disposing) above.
            Dispose(true);
            // TODO: uncomment the following line if the finalizer is overridden above.
            // GC.SuppressFinalize(this);
        }
        #endregion

    }
}