using System.Collections.Generic;
using System.Threading.Tasks;
using SalesOrderManagement.Domain.Entities;

namespace SalesOrderManagement.Application.Interfaces;

public interface IItemRepository
{
    Task<IEnumerable<Item>> GetAllAsync();
    Task<Item?> GetByIdAsync(int id);
}
