using Application.ViewModels;
using AutoMapper;
using SahibGameStore.Domain.Entities.Common;
using SahibGameStore.Application.ViewModels;
using SahibGameStore.Domain.Entities;
using System.Reflection.Metadata;
using SahibGameStore.Application.DTOS.Common;
using System.Data.SqlClient;

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
            CreateMap<CartItem, CartItemDto>()
           .ForMember(dest => dest.GameName, opt => opt.MapFrom(src => src.Game.Name))
           .ForMember(dest => dest.Price, opt => opt.MapFrom(src => src.Game.Price))
           .ForMember(dest => dest.GameImage, opt => opt.MapFrom(src => src.Game.ImageRelativePath))
           .ForMember(dest => dest.Subtotal, opt => opt.MapFrom(src => src.Game.Price * src.Quantity));

            CreateMap<Order, OrderDto>()
                .ForMember(dest => dest.Total, opt => opt.MapFrom(src =>
                    src.ShoppingCart.Items.Sum(i => i.Game.Price * i.Quantity)))
                .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.ShoppingCart.Items));

        }   
    }
}