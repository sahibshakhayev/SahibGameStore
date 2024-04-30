using Application.ViewModels;
using AutoMapper;
using SahibGameStore.Domain.Entities.Common;
using SahibGameStore.Application.ViewModels;
using SahibGameStore.Domain.Entities;
using System.Reflection.Metadata;

namespace SahibGameStore.Application.AutoMapper
{
    public class DomainToViewModelMappingProfile: Profile
    {
        public DomainToViewModelMappingProfile()
        {
            ShouldMapField = fieldInfo => true;
            ShouldMapProperty = propertyInfo => true;
            CreateMap<Token, TokenViewModel>();
            CreateMap<Game,GameViewModel>();
            CreateMap<Game,GameListViewModel>();
            CreateMap<Company,CompanyViewModel>();
            CreateMap<Genre,GenreViewModel>();
            CreateMap<Platform, PlatformViewModel>();
            CreateMap<Review, ReviewListViewModel>();
            CreateMap<Order,OrderListViewModel>();
            
        }   
    }
}