using AutoMapper;
using SalesOrderManagement.API.Models;
using SalesOrderManagement.Domain.Entities;

namespace SalesOrderManagement.API.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Client, ClientDto>();
        CreateMap<Item, ItemDto>();
        
        CreateMap<SalesOrderItem, SalesOrderItemDto>()
            .ForMember(dest => dest.ItemCode, opt => opt.MapFrom(src => src.Item != null ? src.Item.Code : null))
            .ForMember(dest => dest.ItemDescription, opt => opt.MapFrom(src => src.Item != null ? src.Item.Description : null));

        CreateMap<SalesOrder, SalesOrderDto>()
            .ForMember(dest => dest.ClientName, opt => opt.MapFrom(src => src.Client != null ? src.Client.Name : null));

        CreateMap<SaveSalesOrderDto, SalesOrder>()
            .ForMember(dest => dest.OrderItems, opt => opt.MapFrom(src => src.OrderItems))
            .ForMember(dest => dest.Client, opt => opt.Ignore());

        CreateMap<SaveSalesOrderItemDto, SalesOrderItem>()
            .ForMember(dest => dest.Item, opt => opt.Ignore())
            .ForMember(dest => dest.SalesOrder, opt => opt.Ignore());
    }
}
