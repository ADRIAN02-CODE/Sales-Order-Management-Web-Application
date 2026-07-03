using System.Collections.Generic;
using System.Threading.Tasks;
using SalesOrderManagement.Application.Interfaces;
using SalesOrderManagement.Domain.Entities;

namespace SalesOrderManagement.Application.Services;

public class ItemService : IItemService
{
    private readonly IItemRepository _itemRepository;

    public ItemService(IItemRepository itemRepository)
    {
        _itemRepository = itemRepository;
    }

    public Task<IEnumerable<Item>> GetAllItemsAsync()
    {
        return _itemRepository.GetAllAsync();
    }

    public Task<Item?> GetItemByIdAsync(int id)
    {
        return _itemRepository.GetByIdAsync(id);
    }
}
