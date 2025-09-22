using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using SahibGameStore.Application.DTOS.Platforms;
using SahibGameStore.Application.Interfaces;
using SahibGameStore.Application.ViewModels;
using SahibGameStore.Domain.Entities;
using SahibGameStore.Domain.Interfaces.Repositories;

namespace SahibGameStore.Application.Services
{
    public class PlatformServices: IPlatformServices
    {
        private IUnitOfWork _unit;
        private IMapper _mapper;
        public PlatformServices(IUnitOfWork unit, IMapper mapper)
        {
            _unit = unit;
            _mapper = mapper;
        }

        public async Task<IEnumerable<PlatformViewModel>> GetAllPlatforms()
        {
            return _mapper.Map<IEnumerable<PlatformViewModel>>(await _unit.Platforms.GetAllAsync());
        }

        public async Task<PlatformViewModel> GetPlatformById(Guid id)
        {
            return _mapper.Map<PlatformViewModel>(await _unit.Platforms.GetByIdAsync(id));
        }
        public void InsertPlatform(AddOrUpdatePlatformDTO platform)
        {
            _unit.Platforms.Add(_mapper.Map<Platform>(platform));
        }
        public async Task<PlatformViewModel> UpdatePlatform(Guid id, AddOrUpdatePlatformDTO platform)
        {
            var platform_f = _unit.Platforms.GetById(id);

            if (platform_f == null)
                throw new KeyNotFoundException($"Platform with id {id} not found");

            platform_f.ChangeName(platform.Name);

            _unit.Platforms.Update(platform_f);

            await _unit.SaveChangesAsync();

            return _mapper.Map<PlatformViewModel>(platform_f);
        }
        public void DeletePlatform(Guid id)
        {
            _unit.Platforms.Remove(id);
        }
    }
}