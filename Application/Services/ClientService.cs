using System.Collections.Generic;
using System.Threading.Tasks;
using SalesOrderManagement.Application.Interfaces;
using SalesOrderManagement.Domain.Entities;

namespace SalesOrderManagement.Application.Services;

public class ClientService : IClientService
{
    private readonly IClientRepository _clientRepository;

    public ClientService(IClientRepository clientRepository)
    {
        _clientRepository = clientRepository;
    }

    public Task<IEnumerable<Client>> GetAllClientsAsync()
    {
        return _clientRepository.GetAllAsync();
    }

    public Task<Client?> GetClientByIdAsync(int id)
    {
        return _clientRepository.GetByIdAsync(id);
    }
}
