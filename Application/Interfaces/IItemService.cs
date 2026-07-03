using System.Collections.Generic;
using System.Threading.Tasks;
using SalesOrderManagement.Domain.Entities;

namespace SalesOrderManagement.Application.Interfaces;

public interface IItemService
{
    Task<IEnumerable<Item>> GetAllItemsAsync();
    Task<Item?> GetItemByIdAsync(int id);
}
