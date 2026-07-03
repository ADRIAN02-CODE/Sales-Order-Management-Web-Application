using System.Collections.Generic;
using System.Threading.Tasks;
using SalesOrderManagement.Domain.Entities;

namespace SalesOrderManagement.Application.Interfaces;

public interface IClientService
{
    Task<IEnumerable<Client>> GetAllClientsAsync();
    Task<Client?> GetClientByIdAsync(int id);
}
