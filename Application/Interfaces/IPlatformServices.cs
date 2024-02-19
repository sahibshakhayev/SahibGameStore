using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SahibGameStore.Application.DTOS.Platforms;
using SahibGameStore.Application.ViewModels;

namespace SahibGameStore.Application.Interfaces
{
    public interface IPlatformServices
    {
         Task<IEnumerable<PlatformViewModel>> GetAllPlatforms();
        Task<PlatformViewModel> GetPlatformById(Guid platform);
        void InsertPlatform(AddOrUpdatePlatformDTO platform);
        void UpdatePlatform(AddOrUpdatePlatformDTO platform);
        void DeletePlatform(Guid id);
    }
}