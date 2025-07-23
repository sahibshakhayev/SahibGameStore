using AutoMapper;
using SahibGameStore.Application.DTOS.Cart;
using SahibGameStore.Application.DTOS.Companies;
using SahibGameStore.Application.DTOS.Games;
using SahibGameStore.Application.DTOS.Genres;
using SahibGameStore.Application.DTOS.Platforms;
using SahibGameStore.Application.ViewModels;
using SahibGameStore.Domain.Entities;

namespace SahibGameStore.Application.AutoMapper
{
    public class DTOToDomainMappingProfile: Profile
    {
        public DTOToDomainMappingProfile()
        {
            ShouldMapField = fieldInfo => true;
            ShouldMapProperty = propertyInfo => true;

            //DTOS only for post
            //thats why should be translated only from a viewmodel to a entity
            //never outerwise.
            CreateMap<AddOrUpdateGameDTO,Game>();
            CreateMap<AddOrUpdateCompanyDTO, Company>();
            CreateMap<AddOrUpdateGenreDTO, Genre>();
            CreateMap<AddOrUpdatePlatformDTO, Platform>();
            CreateMap<AddOrUpdateGameOverviewDTO, GameOverview>();
        }
    }
}