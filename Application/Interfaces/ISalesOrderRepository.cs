using System.Collections.Generic;
using System.Threading.Tasks;
using SalesOrderManagement.Domain.Entities;

namespace SalesOrderManagement.Application.Interfaces;

public interface ISalesOrderRepository
{
    Task<IEnumerable<SalesOrder>> GetAllAsync();
    Task<SalesOrder?> GetByIdWithItemsAsync(int id);
    Task AddAsync(SalesOrder salesOrder);
    Task UpdateAsync(SalesOrder salesOrder);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
    Task<bool> ExistsInvoiceNoAsync(string invoiceNo, int excludeOrderId = 0);
}
