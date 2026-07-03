using System.Collections.Generic;
using System.Threading.Tasks;
using SalesOrderManagement.Domain.Entities;

namespace SalesOrderManagement.Application.Interfaces;

public interface ISalesOrderService
{
    Task<IEnumerable<SalesOrder>> GetAllOrdersAsync();
    Task<SalesOrder?> GetOrderByIdAsync(int id);
    Task<SalesOrder> CreateOrderAsync(SalesOrder order);
    Task UpdateOrderAsync(SalesOrder order);
    Task DeleteOrderAsync(int id);
    Task<string> GenerateInvoiceNumberAsync();
    Task<bool> ExistsInvoiceNoAsync(string invoiceNo, int excludeOrderId = 0);
}
