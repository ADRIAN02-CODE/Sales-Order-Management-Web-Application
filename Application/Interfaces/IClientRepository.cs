using System.Collections.Generic;
using System.Threading.Tasks;
using SalesOrderManagement.Domain.Entities;

namespace SalesOrderManagement.Application.Interfaces;

public interface IClientRepository
{
    Task<IEnumerable<Client>> GetAllAsync();
    Task<Client?> GetByIdAsync(int id);
}
