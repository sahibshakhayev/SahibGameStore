using AutoMapper;
using SahibGameStore.Application.ViewModels;
using SahibGameStore.Domain.Entities;

namespace SahibGameStore.Application.AutoMapper
{
    public class DomainToViewModelMappingProfile: Profile
    {
        public DomainToViewModelMappingProfile()
        {
            ShouldMapField = fieldInfo => true;
            ShouldMapProperty = propertyInfo => true;
            CreateMap<Game,GameViewModel>();
            CreateMap<Game,GameListViewModel>();
            CreateMap<Company,CompanyViewModel>();
            CreateMap<Genre,GenreViewModel>();
            CreateMap<Platform, PlatformViewModel>();
            CreateMap<Review, ReviewListViewModel>();
        }   
    }
}