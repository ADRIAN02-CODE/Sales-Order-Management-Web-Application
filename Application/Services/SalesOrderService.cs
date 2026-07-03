using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SalesOrderManagement.Application.Interfaces;
using SalesOrderManagement.Domain.Entities;

namespace SalesOrderManagement.Application.Services;

public class SalesOrderService : ISalesOrderService
{
    private readonly ISalesOrderRepository _salesOrderRepository;
    private readonly IItemRepository _itemRepository;

    public SalesOrderService(ISalesOrderRepository salesOrderRepository, IItemRepository itemRepository)
    {
        _salesOrderRepository = salesOrderRepository;
        _itemRepository = itemRepository;
    }

    public Task<IEnumerable<SalesOrder>> GetAllOrdersAsync()
    {
        return _salesOrderRepository.GetAllAsync();
    }

    public Task<SalesOrder?> GetOrderByIdAsync(int id)
    {
        return _salesOrderRepository.GetByIdWithItemsAsync(id);
    }

    public async Task<SalesOrder> CreateOrderAsync(SalesOrder order)
    {
        // Automatically fetch current items price if they are 0 (safeguard)
        foreach (var line in order.OrderItems)
        {
            if (line.Price <= 0)
            {
                var item = await _itemRepository.GetByIdAsync(line.ItemId);
                if (item != null)
                {
                    line.Price = item.Price;
                }
            }
        }

        CalculateTotals(order);
        await _salesOrderRepository.AddAsync(order);
        return order;
    }

    public async Task UpdateOrderAsync(SalesOrder order)
    {
        CalculateTotals(order);
        await _salesOrderRepository.UpdateAsync(order);
    }

    public Task DeleteOrderAsync(int id)
    {
        return _salesOrderRepository.DeleteAsync(id);
    }

    public async Task<string> GenerateInvoiceNumberAsync()
    {
        var orders = await _salesOrderRepository.GetAllAsync();
        int maxNumber = 0;
        foreach (var order in orders)
        {
            if (order.InvoiceNo != null && order.InvoiceNo.StartsWith("INV-", StringComparison.OrdinalIgnoreCase))
            {
                string suffix = order.InvoiceNo.Substring(4);
                if (int.TryParse(suffix, out int num))
                {
                    if (num > maxNumber)
                    {
                        maxNumber = num;
                    }
                }
            }
        }
        return $"INV-{(maxNumber + 1):D4}";
    }

    public Task<bool> ExistsInvoiceNoAsync(string invoiceNo, int excludeOrderId = 0)
    {
        return _salesOrderRepository.ExistsInvoiceNoAsync(invoiceNo, excludeOrderId);
    }

    private void CalculateTotals(SalesOrder order)
    {
        decimal totalExcl = 0;
        decimal totalTax = 0;
        decimal totalIncl = 0;

        foreach (var line in order.OrderItems)
        {
            line.ExclAmount = Math.Round(line.Quantity * line.Price, 2);
            line.TaxAmount = Math.Round(line.ExclAmount * line.TaxRate / 100m, 2);
            line.InclAmount = Math.Round(line.ExclAmount + line.TaxAmount, 2);

            totalExcl += line.ExclAmount;
            totalTax += line.TaxAmount;
            totalIncl += line.InclAmount;
        }

        order.TotalExcl = Math.Round(totalExcl, 2);
        order.TotalTax = Math.Round(totalTax, 2);
        order.TotalIncl = Math.Round(totalIncl, 2);
    }
}
